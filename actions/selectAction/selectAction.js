"use server";

import { prisma } from "@/lib/prisma";

export async function selectSubscriptionPlans() {
  try {
    // we have to send value and label for select options
    const plans = await prisma.plan.findMany({
      // value is the id, label is the name
      select: {
        id: true,
        name: true,
        monthlyPrice: true,
        yearlyPrice: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // Transforming the plans to have value and label for select options
    const transformedPlans = plans.map((plan) => ({
      value: plan.id,
      label: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
    }));

    return { success: true, data: JSON.stringify(transformedPlans) };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return { success: false, error: "Failed to fetch subscription plans" };
  }
}

export async function selectCompany() {
  try {
    const company = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postcode: true,
        phone: true,
        email: true,
      },
    });
    if (!company) {
      return { success: false, error: "No company found" };
    }
    // Transforming the company data to have value and label for select options
    const transformedCompany = company.map((c) => ({
      value: c.id,
      label: c.name,
      address: c.address,
      city: c.city,
      postcode: c.postcode,
      phone: c.phone,
      email: c.email,
    }));
    return { success: true, data: JSON.stringify(transformedCompany) };
  } catch (error) {
    console.error("Error fetching company:", error);
    return { success: false, error: "Failed to fetch company" };
  }
}

export async function selectBranch(params) {
  try {
    const branches = await prisma.branch.findMany({
      where: {
        companyId: params.companyId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        postcode: true,
        phone: true,
        email: true,
      },
    });
    if (!branches || branches.length === 0) {
      return { success: false, error: "No branches found for this company" };
    }
    // Transforming the branches to have value and label for select options
    const transformedBranches = branches.map((branch) => ({
      value: branch.id,
      label: branch.name,
      address: branch.address,
      city: branch.city,
      postcode: branch.postcode,
      phone: branch.phone,
      email: branch.email,
    }));

    return { success: true, data: JSON.stringify(transformedBranches) };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return { success: false, error: "Failed to fetch branches" };
  }
}
