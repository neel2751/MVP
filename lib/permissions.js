"use server";
import { prisma } from "@/lib/prisma";

/**
 * Fetch permissions for a user
 * @param userId - id of the user
 * @param companyId - optional, for company-specific permissions
 */
export async function getPermissions({ userId, companyId }) {
  // Superadmin bypass
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: { include: { RolePermission: { include: { permission: true } } } },
    },
  });

  const isSuperAdmin = userRoles.some((ur) => ur.role.name === "superadmin");
  if (isSuperAdmin) return ["*"]; // wildcard for all permissions

  let permissions = new Set();

  if (companyId) {
    // company-specific role
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

  // global roles without company
  userRoles.forEach((ur) =>
    ur.role.RolePermission.forEach((rp) => permissions.add(rp.permission.name))
  );

  return Array.from(permissions);
}

/**
 * Check if user has a specific permission
 */
export async function can(userId, permission, companyId) {
  const permissions = await getPermissions(userId, companyId);
  if (permissions.includes("*")) return true; // superadmin
  return permissions.includes(permission);
}
