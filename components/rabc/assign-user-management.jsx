"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchQuery } from "@/hooks/use-query";
import { getAllUserRoles, updateUserRolesBulk } from "@/actions/role/role";
import { useSubmitMutation } from "@/hooks/use-mutate";
import CreateUserRole from "./create-user-role";
import React from "react";

export default function AssignUserRole({ roles = [] }) {
  const [open, setOpen] = React.useState(false);

  const { data } = useFetchQuery({
    fetchFn: getAllUserRoles,
    queryKey: ["all-user-roles"],
  });
  const allUserRoles = data?.userRoles || [];

  const { mutate: updateUserRole } = useSubmitMutation({
    mutationFn: async (data) =>
      await updateUserRolesBulk(data?.userId, data?.roleId),
    onSuccessMessage: (message) => message || `User role updated successfully!`,
    invalidateKey: ["all-user-roles"],
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Assign User Roles</CardTitle>
          <CardDescription>Manage users and their roles</CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>Assign User Role</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUserRoles.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user?.user?.name}</TableCell>
                <TableCell>{user?.user?.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.roleId}
                    onValueChange={(value) =>
                      updateUserRole({ userId: user?.user?.id, roleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role?.id} value={role?.id}>
                          {role?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CreateUserRole roles={roles} open={open} setOpen={setOpen} />
      </CardContent>
    </Card>
  );
}
