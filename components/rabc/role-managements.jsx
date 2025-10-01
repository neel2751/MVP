"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Checkbox } from "../ui/checkbox";
import { assignRoleToPermission } from "@/actions/role/role";
import { useSubmitMutation } from "@/hooks/use-mutate";
import AddRole from "./add-role";
import { useState } from "react";
import { PaginationWithLinks } from "../filters/pagination/pagination-client";
import SearchDebounce from "../filters/search/search-debounce";

export default function RoleManagements({ roles, permissions, totalRoles }) {
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  return (
    <>
      {/* make the count and stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <RoleStats title="Total Roles" value={roles?.length} />
        <RoleStats
          title="Global Roles"
          value={roles?.filter((role) => role.isGlobal).length}
        />
        <RoleStats
          title="Local Roles"
          value={roles?.filter((role) => !role.isGlobal).length}
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </div>
          <Button
            onClick={() => {
              setInitialValues(null);
              setOpen(true);
            }}
          >
            <Plus />
            Add Role
          </Button>
          <SearchDebounce />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Permission permissions={permissions} role={role} />
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={"outline"}
                      className={`
                        border-0 text-xs
                        ${role.isGlobal ? "bg-blue-400" : "bg-amber-400"}`}
                    >
                      {role.isGlobal ? "Global" : "Local"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInitialValues(role);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-2">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalRoles > 10 && <PaginationWithLinks totalCount={totalRoles} />}
          <AddRole
            open={open}
            setOpen={setOpen}
            initialValues={initialValues}
          />
        </CardContent>
      </Card>
    </>
  );
}

function RoleStats({ title, value }) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className={"text-foreground"}>{title}</CardTitle>
        <CardDescription
          className="text-2xl font-bold
        text-primary
        "
        >
          {value}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function Permission({ permissions, role }) {
  const { mutate: togglePermission, isPending } = useSubmitMutation({
    mutationFn: async ({ permissionId, hasPermission }) =>
      await assignRoleToPermission(
        permissionId,
        hasPermission ? "remove" : "add",
        role.id
      ),
    invalidateKey: ["roles-list"],
    onSuccessMessage: (message) => message || "Permission updated successfully",
    onClose: () => {},
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span>{role.name}</span>
      </SheetTrigger>
      <SheetContent className="max-w-3xl">
        <SheetHeader>
          <SheetTitle>Permissions for {role.roleName}</SheetTitle>
          <SheetDescription>
            Manage permissions associated with the {role.roleName} role.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Name</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => {
                const isAssigned = role?.RolePermission?.some(
                  (rp) => rp.permissionId === permission.id
                );
                return (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.name}</TableCell>
                    <TableCell>
                      <Checkbox
                        disabled={isPending}
                        checked={isAssigned}
                        onCheckedChange={() =>
                          togglePermission({
                            permissionId: permission.id,
                            hasPermission: isAssigned,
                          })
                        }
                        aria-label={`Assign ${permission.name} permission`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
