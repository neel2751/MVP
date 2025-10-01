"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Mock current user (in a real app, this would come from your auth provider)
export const getCurrentUser = async () => {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.globalRoles, // e.g., 'admin', 'user', 'company', 'superadmin'
    selectedCompanyId: session.user.selectedCompanyId || null,
    selectedBranchId: session.user.selectedBranchId || null,
    companies: session.user.companies || [],
  };
};

export async function getPermissions() {
  const session = await auth(); // fetch current session

  if (!session?.user) return [];

  const userId = session.user.id;
  const companyId = session.user.selectedCompanyId ?? null;
  const branchId = session.user.selectedBranchId ?? null;

  // Superadmin bypass
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: { include: { RolePermission: { include: { permission: true } } } },
    },
  });

  const isSuperAdmin = userRoles.some((ur) => ur.role.name === "superadmin");
  if (isSuperAdmin) return ["*"];

  const permissions = new Set();

  // Add global role permissions
  userRoles.forEach((ur) =>
    ur.role.RolePermission.forEach((rp) => permissions.add(rp.permission.name))
  );

  // Company-specific role
  if (companyId) {
    const companyUser = await prisma.companyUser.findFirst({
      where: { userId, companyId },
      include: {
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
    });
    companyUser?.role.RolePermission.forEach((rp) =>
      permissions.add(rp.permission.name)
    );
  }

  // Branch-specific role (if applicable)
  if (branchId) {
    // Only needed if branch-level roles exist
    const branchUser = await prisma.branchUser?.findFirst({
      where: { userId, branchId },
      include: {
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
    });
    branchUser?.role.RolePermission.forEach((rp) =>
      permissions.add(rp.permission.name)
    );
  }

  return Array.from(permissions);
}
export async function can(permission) {
  const permissions = await getPermissions();
  if (permissions.includes("*")) return true; // superadmin
  return permissions.includes(permission);
}
