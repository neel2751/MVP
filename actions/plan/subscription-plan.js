"use server";

import { revalidatePath } from "next/cache";
import { success, z } from "zod";
import { prisma } from "@/lib/prisma";
import { withTransaction } from "@/lib/transaction";
import { getCurrentUser, can } from "../auth-user";
import {
  createStripePrice,
  createStripeProduct,
  deleteStripeProduct,
} from "../stripe/stripe-intent";
import { logAuditEntry } from "../audit-log";

const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  monthlyPrice: z.number().min(0, "Monthly price must be positive"),
  yearlyPrice: z.number().min(0, "Yearly price must be positive"),
  maxBranches: z.number().min(1, "Must allow at least 1 branch"),
  maxPropertiesPerBranch: z.number().min(1, "Must allow at least 1 property"),
  extraPropertyPrice: z
    .number()
    .min(0, "Additional property price must be positive"),
  extraBranchPrice: z
    .number()
    .min(0, "Additional branch price must be positive"),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  trialPeriodDays: z.number().min(0).optional(),
});

export async function createSubscriptionPlan(formData) {
  const user = await getCurrentUser();
  if (!user.role.includes("superadmin")) {
    return { success: false, error: "Unauthorized" };
  }
  const validatedFields = createSubscriptionPlanSchema.safeParse({
    name: formData?.name,
    description: formData?.description,
    monthlyPrice: Number.parseFloat(formData.monthlyPrice),
    yearlyPrice: Number.parseFloat(formData.yearlyPrice),
    maxBranches: Number.parseInt(formData.maxBranches),
    maxPropertiesPerBranch: Number.parseInt(formData.maxPropertiesPerBranch),
    extraPropertyPrice: Number.parseFloat(formData.extraPropertyPrice),
    extraBranchPrice: Number.parseFloat(formData.extraBranchPrice),
    features: formData.features || [],
    isActive: formData.isActive,
    trialPeriodDays: formData.trialPeriodDays
      ? Number.parseInt(formData.trialPeriodDays)
      : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 1. Initial validation: Check if a plan with this name already exists
    const existingPlan = await prisma.Plan.findFirst({
      where: { name: validatedFields.data.name },
    });
    if (existingPlan) {
      return {
        success: false,
        error: "A subscription plan with this name already exists",
      };
    }

    // Determine if this is a "full" plan requiring Stripe integration (e.g., if it has prices)
    const requiresStripeIntegration =
      validatedFields.data.monthlyPrice > 0 &&
      validatedFields.data.yearlyPrice > 0;

    let finalPlan;

    // Execute all creation/integration steps in a single transaction
    finalPlan = await withTransaction(async (tx) => {
      // A. Create the base plan in the database
      // This includes all data, including trialPeriodDays if provided
      let plan = await tx.Plan.create({
        data: validatedFields.data,
      });
      if (!plan) {
        throw new Error("Failed to create subscription plan in DB");
      }

      // B. Stripe Integration (Conditional)
      if (requiresStripeIntegration) {
        // 1. Create the product in Stripe
        const product = await createStripeProduct({
          name: plan.name,
          description: plan.description,
          features: plan.features,
          planId: plan.id,
        });
        if (!product) {
          throw new Error("Failed to create product in Stripe");
        }

        // 2. Create the monthly subscription price in Stripe
        const monthlyPrice = await createStripePrice({
          price: plan.monthlyPrice,
          currency: "gbp", // Assuming GBP, change as needed
          interval: "month",
          stripeProductId: product.id,
          planId: plan.id,
        });

        // 3. Create the yearly subscription price in Stripe
        const yearlyPrice = await createStripePrice({
          price: plan.yearlyPrice,
          currency: "gbp", // Assuming GBP, change as needed
          interval: "year",
          stripeProductId: product.id,
          planId: plan.id,
        });

        if (!monthlyPrice || !yearlyPrice) {
          throw new Error("Failed to create prices in Stripe");
        }

        // 4. Update the plan in the database with the Stripe IDs
        plan = await tx.Plan.update({
          where: { id: plan.id },
          data: {
            stripeProductId: product.id,
            monthlyStripePlanId: monthlyPrice.id,
            yearlyStripePlanId: yearlyPrice.id,
          },
        });
      }

      // C. Log the audit entry
      const auditEntry = await logAuditEntry({
        action: "create",
        entity: "subscription-plan",
        entityId: plan.id, // Use the ID of the finalized plan
        changes: validatedFields.data,
      });
      if (!auditEntry.success) {
        throw new Error("Failed to log audit entry");
      }

      return plan; // Return the final, complete object (either with or without Stripe IDs)
    });

    // 3. Post-transaction steps
    revalidatePath("/superadmin/plan");
    return { success: true, plan: finalPlan };
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return { success: false, error: "Failed to create subscription plan" };
  }
}

export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.Plan.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, plans };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return { success: false, error: "Failed to fetch subscription plans" };
  }
}

export async function updateSubscriptionPlan(formData, planId) {
  const user = await can("update:subscription-plan");
  if (!user) {
    return {
      success: false,
      error: "you do not have permission to update subscription plans",
    };
  }
  const id = planId;
  if (!id) {
    return { success: false, error: "Plan ID is required" };
  }
  const validatedFields = createSubscriptionPlanSchema.safeParse({
    name: formData?.name,
    description: formData?.description,
    monthlyPrice: Number.parseFloat(formData.monthlyPrice),
    yearlyPrice: Number.parseFloat(formData.yearlyPrice),
    maxBranches: Number.parseInt(formData.maxBranches),
    maxPropertiesPerBranch: Number.parseInt(formData.maxPropertiesPerBranch),
    extraPropertyPrice: Number.parseFloat(formData.extraPropertyPrice),
    extraBranchPrice: Number.parseFloat(formData.extraBranchPrice),
    features: formData.features || [],
    isActive: formData.isActive,
    trialPeriodDays: formData.trialPeriodDays
      ? Number.parseInt(formData.trialPeriodDays)
      : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const plan = await prisma.plan.update({
      where: { id },
      data: validatedFields.data,
    });
    //

    revalidatePath("/superadmin/subscription-plans");
    return { success: true, plan };
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return { success: false, error: "Failed to update subscription plan" };
  }
}

export async function deleteSubscriptionPlan(planId) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const has = await can("delete:subscription-plan");
  if (!has) {
    return {
      success: false,
      error: "You do not have permission to delete subscription plans",
    };
  }

  try {
    // Check if any companies are using this plan
    const subscriptionsCount = await prisma.subscription.count({
      where: { planId },
    });

    if (subscriptionsCount > 0) {
      return {
        success: false,
        error: "Cannot delete plan that is currently in use by companies",
      };
    }

    // log audit entry
    const auditEntry = await logAuditEntry({
      action: "delete",
      entity: "subscription-plan",
      entityId: planId,
    });
    if (!auditEntry.success) {
      return { success: false, error: "Failed to log audit entry" };
    }
    const del = await prisma.plan.delete({
      where: { id: planId },
    });
    if (!del) {
      return { success: false, error: "Subscription plan not found" };
    }
    // we have to delete the product from Stripe as well
    if (del.stripeProductId) {
      // add the log entry here
      logAuditEntry({
        action: "delete",
        entity: "stripe-product",
        entityId: del.stripeProductId,
      });
      await deleteStripeProduct(del.stripeProductId);
    }
    revalidatePath("/superadmin/plan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return { success: false, error: "Failed to delete subscription plan" };
  }
}

// delete all Stripe subscription plans
export async function deleteAllStripeSubscriptionPlans() {
  const user = await getCurrentUser();

  if (user.role !== "superadmin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Fetch all active subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });

    for (const plan of plans) {
      if (plan.monthlyStripePriceId) {
        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: { monthlyStripePriceId: null, yearlyStripePriceId: null },
        });
      }
    }
    // Now delete all products from Stripe
    const eliminatedProducts = await deleteStripeProduct();

    return { success: true, message: "All Stripe subscription plans deleted" };
  } catch (error) {
    console.error("Error deleting Stripe subscription plans:", error);
    return {
      success: false,
      error: "Failed to delete Stripe subscription plans",
    };
  }
}
