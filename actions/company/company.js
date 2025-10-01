"use server";

import { hashPassword } from "@/lib/password";
import { can } from "../auth-user";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer } from "../stripe/stripe-intent";
import { logAuditEntry } from "../audit-log";

export async function createCompany(data) {
  const isMake = await can("create.company");
  if (!isMake) {
    return {
      success: false,
      error: "You do not have permission to create a company.",
    };
  }

  // Example using a hypothetical ORM
  try {
    // 1 Check the domain is aleady taken
    const existingCompany = await prisma.company.findUnique({
      where: { domain: data.domain },
    });
    if (existingCompany) {
      return { success: false, error: "The domain is already taken." };
    }

    // 1.2 Create Stripe customer here and get the customer ID
    const stripeCustomerId = await createStripeCustomer({
      name: data.name,
      email: data.adminEmail,
      metadata: {
        domain: data.domain,
        planId: data.planId,
      },
    });

    // 2 Create the company
    const company = await prisma.company.create({
      data: {
        name: data.name,
        domain: data.domain,
        status: data.status,
        planId: data.planId,
        stripeCustomerId: stripeCustomerId.id || null,
      },
    });
    // 3 Ensure user exists if not create user
    let user = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.adminEmail,
          name: data.adminName || data.adminEmail,
          password: await hashPassword("ChangeMe123!"),
        },
      });
    }

    // 4 Assign user as admin to the company
    const compantAdminRole = await prisma.role.findFirst({
      where: { name: "company-admin" },
    });
    if (compantAdminRole) {
      await prisma.companyUser.create({
        data: {
          companyId: company.id,
          userId: user.id,
          roleId: compantAdminRole.id,
        },
      });
    }
    // 5 find the subscription plan and create the subscription
    const subscriptionPlan = await prisma.plan.findFirst({
      where: { id: data.planId },
    });
    if (subscriptionPlan) {
      const startDate = new Date();
      // we have trialPeriodDays in the plan
      let endDate = new Date();
      endDate.setDate(
        startDate.getDate() + subscriptionPlan.trialPeriodDays || 14
      );
      const newSubscription = await prisma.subscription.create({
        data: {
          companyId: company.id,
          planId: subscriptionPlan.id,
          startDate: startDate,
          endDate: endDate,
          status: "active",
          isTrial: true,
        },
      });

      // 5.1 Create a internal invoice for the trial period
      await prisma.invoice.create({
        data: {
          // companyId: company.id, // we can link to company later if needed
          subscriptionId: newSubscription.id,
          invoiceDate: new Date(),
          dueDate: new Date(),
          amount: 0,
          status: "paid",
          currency: "GBP",
          // description: `Trial period for ${
          //   subscriptionPlan ? subscriptionPlan.name : "the selected plan"
          // }`, // we can add description later if needed
        },
      });
    }

    await logAuditEntry({
      action: "create",
      entity: "company",
      entityId: company.id,
      changes: `Company ${company.name} created with admin ${user.email}`,
    });

    // 6 Return the created company
    const newCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });
    return { success: true, company: newCompany };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, error: "Failed to create company" };
  }
}
