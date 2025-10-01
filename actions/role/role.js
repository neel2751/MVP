"use server";

import { prisma } from "@/lib/prisma";
import { can } from "../auth-user";
import { revalidatePath } from "next/cache";
import { generateRandomPassword, hashPassword } from "@/lib/password";

export async function getRoles(params) {
  const isAllwoed = await can("view_roles");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  const { page = 1, pageSize = 10, search = "" } = params || {};

  try {
    // we have to add the pagination here now

    const roles = await prisma.role.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: { RolePermission: { include: { permission: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    // total count for pagination
    const totalRoles = await prisma.role.count({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return { success: true, roles, totalRoles };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

export async function createRole(data) {
  const isAllwoed = await can("create_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // we check to see if the role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: data.name },
    });
    if (existingRole) {
      return { success: false, error: "Role with this name already exists" };
    }
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        isGlobal: data.isGlobal || false,
        // RolePermission: {
        //   create: data.permissions.map((permission) => ({
        //     permission: {
        //       connect: { name: permission }, // connect to existing permission by name
        //     },
        //   })),
        // },
      },
      //   include: { RolePermission: { include: { permission: true } } },
    });
    revalidatePath("superadmin/roles");
    return { success: true, role };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function updateRole(data, roleId) {
  const isAllwoed = await can("update_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  // Implementation for updating a role goes here
  try {
    // we check to see if the role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: data.name, NOT: { id: roleId } },
    });
    if (existingRole) {
      return { success: false, error: "Role with this name already exists" };
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        isGlobal: data.isGlobal || false,
        // RolePermission: {
        //   deleteMany: {}, // remove existing permissions
        //   create: data.permissions.map((permission) => ({
        //     permission: {
        //       connect: { name: permission }, // connect to existing permission by name
        //     },
        //   })),
        // },
      },
      //   include: { RolePermission: { include: { permission: true } } },
    });
    revalidatePath("superadmin/roles");
    return { success: true, role };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteRole(roleId) {
  const isAllwoed = await can("delete_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });
    await prisma.userRole.deleteMany({
      where: { roleId },
    });
    await prisma.role.delete({
      where: { id: roleId },
    });
    revalidatePath("superadmin/roles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

// Permissions

export async function getPermissionsList() {
  const isAllwoed = await can("view_permissions");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, permissions };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { success: false, error: "Failed to fetch permissions" };
  }
}

export async function createPermission(data) {
  const isAllwoed = await can("create_permission");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    // we check to see if the permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: { name: data.name },
    });
    if (existingPermission) {
      return {
        success: false,
        error: "Permission with this name already exists",
      };
    }

    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    revalidatePath("superadmin/permissions");
    return { success: true, permission };
  } catch (error) {
    console.error("Error creating permission:", error);
    return { success: false, error: "Failed to create permission" };
  }
}

export async function updatePermission(data, permissionId) {
  const isAllwoed = await can("update_permission");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    // we check to see if the permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: { name: data.name, NOT: { id: permissionId } },
    });
    if (existingPermission) {
      return {
        success: false,
        error: "Permission with this name already exists",
      };
    }

    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    revalidatePath("superadmin/permissions");
    return { success: true, permission };
  } catch (error) {
    console.error("Error updating permission:", error);
    return { success: false, error: "Failed to update permission" };
  }
}

export async function deletePermission(permissionId) {
  const isAllwoed = await can("delete_permission");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await prisma.rolePermission.deleteMany({
      where: { permissionId },
    });
    await prisma.permission.delete({
      where: { id: permissionId },
    });
    revalidatePath("superadmin/permissions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return { success: false, error: "Failed to delete permission" };
  }
}

// User Roles

export async function getAllUserRoles() {
  const isAllwoed = await can("view_user_roles");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const userRoles = await prisma.userRole.findMany({
      include: {
        user: true,
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
      orderBy: { user: { email: "asc" } },
    });
    return { success: true, userRoles };
  } catch (error) {
    console.error("Error fetching all user roles:", error);
    return { success: false, error: "Failed to fetch all user roles" };
  }
}

// Create a user and assign a role to the user
export async function createUserAndAssignRole(data) {
  const isAllwoed = await can("assign_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const email = data.email.toLowerCase();
    const roleId = data.roleId;
    const password = await hashPassword("Webmints@1234");
    if (!email || !roleId) {
      return { success: false, error: "Email and Role ID are required" };
    }

    // check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return { success: false, error: "User with this email already exists" };
    }

    if (!user) {
      // create user if not exists
      user = await prisma.user.create({
        data: {
          email,
          password,
          name: data.name || email.split("@")[0],
          isActive: true,
          isVerified: true,
        },
      });
    }

    // check if the user already has the role
    const existingUserRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId },
    });
    if (existingUserRole) {
      return { success: false, error: "User already has this role assigned" };
    }

    // assign role to user
    const userRole = await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId,
      },
      include: {
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
    });
    revalidatePath("superadmin/users");
    return { success: true, user, userRole };
  } catch (error) {
    console.error("Error creating user and assigning role:", error);
    return { success: false, error: "Failed to create user and assign role" };
  }
}

export async function getUserRoles(userId) {
  const isAllwoed = await can("view_user_roles");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
    });
    return { success: true, userRoles };
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return { success: false, error: "Failed to fetch user roles" };
  }
}

export async function assignUserRole(userId, roleId) {
  const isAllwoed = await can("assign_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: {
          include: { RolePermission: { include: { permission: true } } },
        },
      },
    });
    revalidatePath("superadmin/users");
    return { success: true, userRole };
  } catch (error) {
    console.error("Error assigning role to user:", error);
    return { success: false, error: "Failed to assign role to user" };
  }
}

export async function updateUserRole(userId, oldRoleId, newRoleId) {
  const isAllwoed = await can("assign_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await prisma.userRole.updateMany({
      where: { userId, roleId: oldRoleId },
      data: { roleId: newRoleId },
    });
    revalidatePath("superadmin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function removeUserRole(userId, roleId) {
  const isAllwoed = await can("remove_role");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
    revalidatePath("superadmin/users");
    return { success: true };
  } catch (error) {
    console.error("Error removing role from user:", error);
    return { success: false, error: "Failed to remove role from user" };
  }
}

export async function assignRoleToPermission(permissionId, action, roleId) {
  const isAllwoed = await can("assign_permission");
  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }

  if (!permissionId || !["add", "remove"].includes(action) || !roleId) {
    return { success: false, error: "Invalid data" };
  }
  try {
    if (action === "add") {
      const existing = await prisma.rolePermission.findFirst({
        where: { roleId, permissionId },
      });
      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId,
            permissionId,
          },
        });
      }
    } else if (action === "remove") {
      await prisma.rolePermission.deleteMany({
        where: { roleId, permissionId },
      });
    }

    // const updatedRole = await prisma.role.findUnique({
    //   where: { id: roleId },
    //   include: { RolePermission: { include: { permission: true } } },
    // });

    revalidatePath("superadmin/roles");
    return {
      success: true,
      //   role: updatedRole,
      message: `Permission ${
        action === "remove" ? "removed from" : "added to"
      } role`,
    };
  } catch (error) {
    console.error("Error assigning permission to role:", error);
    return { success: false, error: "Failed to assign permission to role" };
  }
}
export async function updateUserRolesBulk(userId, newRoleIds) {
  const isAllwoed = await can("assign_role");

  if (!isAllwoed) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    // fetch existing roles
    const existingUserRoles = await prisma.userRole.findMany({
      where: { userId },
    });

    const existingRoleIds = existingUserRoles.map((ur) => ur.roleId);

    // determine roles to add and remove
    const rolesToAdd = newRoleIds.filter((id) => !existingRoleIds.includes(id));
    const rolesToRemove = existingRoleIds.filter(
      (id) => !newRoleIds.includes(id)
    );

    // perform additions
    const addPromises = rolesToAdd.map((roleId) =>
      prisma.userRole.create({ data: { userId, roleId } })
    );

    // perform removals
    const removePromises = rolesToRemove.map((roleId) =>
      prisma.userRole.deleteMany({ where: { userId, roleId } })
    );

    await Promise.all([...addPromises, ...removePromises]);

    revalidatePath("superadmin/roles");
    return { success: true };
  } catch (error) {
    console.error("Error updating user roles in bulk:", error);
    return { success: false, error: "Failed to update user roles in bulk" };
  }
}
