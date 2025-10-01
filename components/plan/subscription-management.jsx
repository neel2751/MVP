"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Crown, Building, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CreateSubscriptionPlanDialog } from "./create-subscription-dialog";
import { DeleteSubscriptionPlanDialog } from "./delete-subscription-plan";
import { usePermission } from "@/hooks/use-permission";

export function SubscriptionPlanManagement({ initialPlans }) {
  const [plans, setPlans] = useState(initialPlans);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleCreatePlan = (plan) => {
    selectedPlan
      ? setPlans(plans.map((p) => (p.id === plan.id ? plan : p)))
      : setPlans([plan, ...plans]);
    selectedPlan
      ? toast.success("Subscription plan updated successfully.")
      : toast.success("Subscription plan created successfully.");
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsCreateOpen(true);
  };

  const handleDeletePlan = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const handlePlanDeleted = (planId) => {
    setPlans(plans.filter((p) => p.id !== planId));
    toast.error("Subscription plan deleted successfully.");
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case "foundation":
        return <Home className="h-5 w-5 text-blue-500" />;
      case "growth":
        return <Building className="h-5 w-5 text-purple-500" />;
      case "professional":
        return <Crown className="h-5 w-5 text-amber-500" />;
      default:
        return <Home className="h-5 w-5 text-gray-500" />;
    }
  };
  const canEdit = usePermission("edit:subscription-plan");
  const canDelete = usePermission("delete:subscription-plan");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Manage subscription plans, pricing, and features
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Plan Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans
          ?.filter((plan) => plan.isActive)
          ?.map((plan) => (
            <Card key={plan?.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-xl">{plan?.name}</CardTitle>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan?.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      £{plan?.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    £{plan?.yearlyPrice}/year (save £
                    {plan?.monthlyPrice * 12 - plan.yearlyPrice})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Max Branches</span>
                    <span className="font-medium">{plan?.maxBranches}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Max Properties</span>
                    <span className="font-medium">
                      {plan?.maxPropertiesPerBranch}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Additional Branch Price</span>
                    <span className="font-medium">
                      £{plan?.extraBranchPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Additional Property</span>
                    <span className="font-medium">
                      £{plan?.extraPropertyPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Features:</p>
                  <ul className="text-xs space-y-1">
                    {plan?.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                    {plan?.features.length > 3 && (
                      <li className="text-muted-foreground">
                        +{plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Yearly Price</TableHead>
                <TableHead>Max Branches</TableHead>
                <TableHead>Max Properties</TableHead>
                <TableHead>Additional Property Price</TableHead>
                <TableHead>Additional Branch Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map((plan) => (
                <TableRow key={plan?.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan?.name)}
                      {plan?.name}
                    </div>
                  </TableCell>
                  <TableCell>£{plan?.monthlyPrice}</TableCell>
                  <TableCell>£{plan?.yearlyPrice}</TableCell>
                  <TableCell>{plan?.maxBranches}</TableCell>
                  <TableCell>{plan?.maxPropertiesPerBranch}</TableCell>
                  <TableCell>£{plan?.extraPropertyPrice}</TableCell>
                  <TableCell>£{plan?.extraBranchPrice}</TableCell>
                  <TableCell>
                    <Badge variant={plan?.isActive ? "default" : "secondary"}>
                      {plan?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSubscriptionPlanDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onPlanCreated={handleCreatePlan}
        initialValues={selectedPlan}
      />
      {selectedPlan && (
        <>
          <DeleteSubscriptionPlanDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            plan={selectedPlan}
            onPlanDeleted={handlePlanDeleted}
          />
        </>
      )}
    </div>
  );
}
