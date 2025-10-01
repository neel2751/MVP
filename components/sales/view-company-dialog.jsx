"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  TrendingUp,
  Activity,
} from "lucide-react";
import { getBranchesForCompany } from "@/actions/branch/branch";

export function ViewCompanyDialog({ open, onOpenChange, company }) {
  const [branches, setBranches] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && company) {
      loadCompanyData();
    }
  }, [open, company]);

  const loadCompanyData = async () => {
    if (!company) return;

    setLoading(true);
    try {
      const [branchesResult, usageResult] = await Promise.all([
        getBranchesForCompany(company.id),
        // getCompanyUsage(company.id),
      ]);

      if (branchesResult.success) {
        setBranches(branchesResult.branches);
      }

      if (usageResult.success) {
        setUsage(usageResult.data);
      }
    } catch (error) {
      console.error("Failed to load company data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  const formatFeatureName = (feature) => {
    return feature
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {company.name}
          </DialogTitle>
          <DialogDescription>
            Company details, subscription, and usage information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {company.address}, {company.city}, {company.postcode}
                    </span>
                  </div>

                  {company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.email}</span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Created:{" "}
                      {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Badge
                      variant={
                        company.status === "active" ? "default" : "secondary"
                      }
                    >
                      {company.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {company.currentBranches}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Branches
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {company.currentProperties}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Properties
                      </div>
                    </div>
                  </div>

                  {company.subscription && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">
                        Current Plan
                      </div>
                      <Badge variant="outline">
                        {company.subscription.plan.name}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {company.subscription.billingPeriod} billing
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            {company.subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Plan:</span>{" "}
                      {company.subscription.plan.name}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge
                        variant={
                          company.subscription.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {company.subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Billing:</span>{" "}
                      {company.subscription.billingPeriod}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> £
                      {company.subscription.billingPeriod === "Yearly"
                        ? company.subscription.plan.yearlyPrice
                        : company.subscription.plan.monthlyPrice}
                      /
                      {company.subscription.billingPeriod === "Yearly"
                        ? "year"
                        : "month"}
                    </div>
                    <div>
                      <span className="font-medium">Current Period:</span>{" "}
                      {new Date(
                        company.subscription.currentPeriodStart
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        company.subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Plan Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Branches:</span>
                      <span>
                        {company.currentBranches} /{" "}
                        {company.subscription.plan.maxBranches}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Properties:</span>
                      <span>
                        {company.currentProperties} /{" "}
                        {company.subscription.plan.maxProperties}
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="font-medium mb-2">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {company.subscription.plan.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="text-xs"
                          >
                            {formatFeatureName(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No active subscription
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Branches</CardTitle>
                <CardDescription>
                  All branches under this company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {branches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">
                            {branch.name}
                          </TableCell>
                          <TableCell>
                            {branch.city}, {branch.postcode}
                          </TableCell>
                          <TableCell>{branch._count.properties}</TableCell>
                          <TableCell>{branch._count.users}</TableCell>
                          <TableCell>
                            {branch.subdomain ? (
                              <Badge variant="outline">
                                {branch.subdomain}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                branch.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {branch.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No branches found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usage ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {usage.totalUsers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Users
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {usage.totalTenants}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Tenants
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {usage.totalTransactions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transactions
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Loading usage data...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
