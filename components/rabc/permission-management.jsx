import { useState } from "react";
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
import AddPermission from "./add-permission";

export default function PermissionsManagement({ permissions }) {
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Permissions Management</CardTitle>
          <CardDescription>Manage permissions for roles</CardDescription>
        </div>
        <Button
          onClick={() => {
            setInitialValues(null);
            setOpen(true);
          }}
        >
          Add Permission
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions &&
              permissions?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setInitialValues(permission);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePermission(permission.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <AddPermission
          open={open}
          setOpen={setOpen}
          initialValues={initialValues}
        />
      </CardContent>
    </Card>
  );
}
