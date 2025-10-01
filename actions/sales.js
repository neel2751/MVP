"use server";

import { prisma } from "@/lib/prisma";

export async function getCompaniesForSales() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate usage for each company
    const companiesWithUsage = await Promise.all(
      companies.map(async (company) => {
        const branches = await prisma.branch.count({
          where: { companyId: company.id },
        });

        // const properties = await prisma.property.count({
        //   where: {
        //     branch: {
        //       companyId: company.id,
        //     },
        //   },
        // });

        return {
          ...company,
          usage: {
            branches,
            // properties,
          },
        };
      })
    );

    return { success: true, companies: companiesWithUsage };
  } catch (error) {
    console.error("Error fetching companies for sales:", error);
    return { success: false, error: "Failed to fetch companies" };
  }
}
