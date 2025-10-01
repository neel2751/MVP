"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddBranch from "./add-branch";

export default function BranchManagement() {
  const [branches, setBranches] = useState([
    { id: 1, name: "Main Branch", status: "Active" },
    { id: 2, name: "Secondary Branch", status: "Inactive" },
  ]);

  const [newBranch, setNewBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Branch Management</CardTitle>
          <CardDescription>
            Manage branches, their details, and statuses.
          </CardDescription>
        </div>
        <Button onClick={() => setNewBranch(!newBranch)}>
          {newBranch ? "Cancel" : "Add Branch"}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.name}</TableCell>
                <TableCell>
                  <Select value={branch.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
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
        <AddBranch
          open={newBranch}
          setOpen={setNewBranch}
          initialValues={editingBranch}
        />
      </CardContent>
    </Card>
  );
}
