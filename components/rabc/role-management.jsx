"use client";
import { Shield, Users, Building } from "lucide-react";
import { ReusableTabs } from "../reusable-tabs";
import RoleManagements from "./role-managements";
import PermissionsManagement from "./permission-management";
import { useFetchQuery } from "@/hooks/use-query";
import { getPermissionsList, getRoles } from "@/actions/role/role";
import AssignUserRole from "./assign-user-management";

export function RoleManagement({ searchParam }) {
  const page = searchParam.page || 1;
  const pageSize = searchParam.pageSize || 10;
  const search = searchParam.query || "";
  const { data, isLoading } = useFetchQuery({
    fetchFn: getRoles,
    params: { page, pageSize, search },
    queryKey: ["roles-list", page, pageSize, search],
  });

  const { data: permission } = useFetchQuery({
    fetchFn: getPermissionsList,
    queryKey: ["permission-list"],
  });
  const roles = data?.roles || [];
  const totalRoles = data?.totalRoles || 0;
  const permissions = permission?.permissions || [];

  return (
    <div>
      <ReusableTabs
        tabs={[
          {
            label: "Roles",
            value: "roles",
            icon: Shield,
            content: (
              <RoleManagements
                totalRoles={totalRoles}
                roles={roles}
                permissions={permissions}
              />
            ),
          },
          {
            label: "Permissions",
            value: "permissions",
            icon: Users,
            content: <PermissionsManagement permissions={permissions} />,
          },
          {
            label: "Assign Users",
            value: "assign_users",
            icon: Building,
            content: <AssignUserRole roles={roles} />,
          },
        ]}
      />
    </div>
  );
}
