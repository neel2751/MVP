"use server";

import { prisma } from "@/lib/prisma";

export async function getBranchesForCompany(companyId) {
  // Check permissions

  try {
    const branches = await prisma.branch.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            properties: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, branches };
  } catch (error) {
    console.error("Error fetching company branches:", error);
    return { success: false, error: "Failed to fetch company branches" };
  }
}
