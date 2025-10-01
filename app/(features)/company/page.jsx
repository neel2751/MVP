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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([
    { id: 1, name: "TechCorp", subscription: "Premium" },
    { id: 2, name: "BizGroup", subscription: "Basic" },
  ]);

  const [subscriptions] = useState(["Basic", "Standard", "Premium"]);
  const [newCompany, setNewCompany] = useState({
    name: "",
    subscription: "Basic",
  });
  const [editingCompany, setEditingCompany] = useState(null);

  const handleCreateOrUpdate = () => {
    if (editingCompany) {
      setCompanies(
        companies.map((company) =>
          company.id === editingCompany.id
            ? { ...editingCompany, ...newCompany }
            : company
        )
      );
      setEditingCompany(null);
    } else {
      setCompanies([...companies, { ...newCompany, id: companies.length + 1 }]);
    }
    setNewCompany({ name: "", subscription: "Basic" });
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setNewCompany({ name: company.name, subscription: company.subscription });
  };

  const handleDelete = (id) => {
    setCompanies(companies.filter((company) => company.id !== id));
  };

  const handleSubscriptionChange = (id, subscription) => {
    setCompanies(
      companies.map((company) =>
        company.id === id ? { ...company, subscription } : company
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Management</CardTitle>
        <CardDescription>
          Manage companies, their details, and subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  <Select
                    value={company.subscription}
                    onValueChange={(value) =>
                      handleSubscriptionChange(company.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(company)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleDelete(company.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="Enter company name"
            value={newCompany.name}
            onChange={(e) =>
              setNewCompany({ ...newCompany, name: e.target.value })
            }
            className="mb-2"
          />
          <Label htmlFor="companySubscription">Subscription</Label>
          <Select
            value={newCompany.subscription}
            onValueChange={(value) =>
              setNewCompany({ ...newCompany, subscription: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subscription" />
            </SelectTrigger>
            <SelectContent>
              {subscriptions.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="mt-4" onClick={handleCreateOrUpdate}>
            {editingCompany ? "Update Company" : "Add Company"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
