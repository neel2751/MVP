import { getPermissionsList, getRoles } from "@/actions/role/role";
import { RoleManagement } from "@/components/rabc/role-management";
import { useQueryServer } from "@/hooks/use-query-server";

export default async function RolesPage({ searchParams }) {
  const searchParam = await searchParams;
  //   const page = searchParam.page || 1;
  //   const pageSize = searchParam.pageSize || 10;

  //   let rolesData = null; // Changed from 'roles' to 'rolesData' to hold the full result object
  //   let permissions = null;

  //   try {
  //     // Fetch Roles data
  //     const rolesResult = await useQueryServer({
  //       fetchFn: getRoles,
  //       params: { page, pageSize },
  //       queryKey: ["roles-list", page, pageSize],
  //     });
  //     // Serialize the result to clean it up before passing it to the client
  //     rolesData = rolesResult;

  //     // Fetch Permissions data
  //     const permissionsResult = await useQueryServer({
  //       fetchFn: getPermissionsList,
  //       queryKey: ["permissions-list"],
  //     });
  //     // Serialize the result
  //     permissions = permissionsResult;
  //   } catch (error) {
  //     console.error("Data fetching failed on server:", error);
  //     // Display a basic error message if fetching fails
  //     return (
  //       <div className="p-8 text-center text-red-600">
  //         Failed to load role data due to a server error.
  //       </div>
  //     );
  //   }

  //   // Ensure we have necessary data before rendering RoleManagement
  //   if (
  //     !rolesData ||
  //     !permissions ||
  //     !rolesData.success ||
  //     !permissions.success
  //   ) {
  //     return (
  //       <div className="p-8 text-center text-yellow-600">
  //         Missing critical data for role management.
  //       </div>
  //     );
  //   }

  //   // --- FIX APPLIED HERE ---
  //   const rolesList = rolesData.roles;
  //   const totalRolesCount = rolesData.totalRoles;
  //   const permissionsList = permissions.permissions;
  //   // --- END FIX ---
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>
      <RoleManagement
        searchParam={searchParam}
        // roles={rolesList}
        // totalRoles={totalRolesCount}
        // permissions={permissionsList}
      />
    </div>
  );
}
