"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Building,
  Users,
  CreditCard,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CreateCompanyDialog } from "./create-company-dialog";
import { ViewCompanyDialog } from "./view-company-dialog";

export function SalesManagement({ initialCompanies }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(
    (company) => company.status === "active"
  ).length;
  const totalRevenue = companies.reduce((sum, company) => {
    if (company.subscription?.status === "active") {
      return sum + company.subscription.plan.monthlyPrice;
    }
    return sum;
  }, 0);
  const totalUsers = companies.reduce(
    (sum, company) => sum + company._count.users,
    0
  );

  const handleCreateCompany = (company) => {
    setCompanies([company, ...companies]);
    toast.success("Company created successfully");
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setIsViewOpen(true);
  };

  const handleManageSubscription = (company) => {
    setSelectedCompany(company);
  };

  const getSubscriptionStatus = (company) => {
    if (!company.subscription) {
      return <Badge variant="secondary">No Subscription</Badge>;
    }

    switch (company.subscription.status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sales Management
          </h1>
          <p className="text-muted-foreground">
            Manage companies, subscriptions, and sales performance
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{totalCompanies}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Active Companies
                </p>
                <p className="text-2xl font-bold">{activeCompanies}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Building className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{company.name}</div>
                      {company.email && (
                        <div className="text-sm text-muted-foreground">
                          {company.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{company.city}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getSubscriptionStatus(company)}
                      {company.subscription && (
                        <div className="text-xs text-muted-foreground">
                          {company.subscription.plan.name} -{" "}
                          {company.subscription.billingPeriod}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{company.usage.branches} branches</div>
                      <div className="text-muted-foreground">
                        {company.usage.properties} properties
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.subscription?.status === "active" ? (
                      <div className="text-sm">
                        <div>£{company.subscription.plan.monthlyPrice}/mo</div>
                        <div className="text-muted-foreground">
                          £
                          {(
                            company.subscription.plan.monthlyPrice * 12
                          ).toFixed(2)}
                          /yr
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        company.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }
                    >
                      {company.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCompany(company)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageSubscription(company)}
                      >
                        <CreditCard className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Create Company Modal */}
      <CreateCompanyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCompanyCreated={handleCreateCompany}
      />
      {selectedCompany && (
        <>
          <ViewCompanyDialog
            open={isViewOpen}
            onOpenChange={setIsViewOpen}
            company={selectedCompany}
          />
        </>
      )}
    </div>
  );
}
