"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { createSubscriptionPlan } from "@/actions/billings/subscription-plans";
import { toast } from "sonner";
import { DynamicForm } from "../form/dynamic-form";

export function CreateSubscriptionPlanDialog({
  open,
  onOpenChange,
  onPlanCreated,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Plan Name",
      validationOptions: { required: "Plan name is required" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      validationOptions: { required: "Description is required" },
    },
    {
      name: "monthlyPrice",
      type: "number",
      label: "Monthly Price (£)",
      validationOptions: { required: "Monthly price is required", min: 0 },
    },
    {
      name: "yearlyPrice",
      type: "number",
      label: "Yearly Price (£)",
      validationOptions: { required: "Yearly price is required", min: 0 },
    },
    {
      name: "maxBranches",
      type: "number",
      label: "Max Branches",
      validationOptions: { required: "Max branches is required", min: 1 },
    },
    {
      name: "maxProperties",
      type: "number",
      label: "Max Properties",
      validationOptions: { required: "Max properties is required", min: 1 },
    },
    {
      name: "additionalBranchPrice",
      type: "number",
      label: "Additional Branch Price (£)",
      validationOptions: {
        required: "Additional branch price is required",
        min: 0,
      },
    },
    {
      name: "additionalPropertyPrice",
      type: "number",
      label: "Additional Property Price (£)",
      validationOptions: {
        required: "Additional property price is required",
        min: 0,
      },
    },
    { name: "isActive", type: "switch", label: "Enable this plan" },
    {
      name: "features",
      type: "multipleInput",
      label: "Features",
      placeholder: "Add a feature and press Enter",
      maxItems: 5,
      description: "Add up to 20 features for this plan",
      validationOptions: { required: "At least one feature is required" },
    },
  ];

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await createSubscriptionPlan(data);
      if (result.success) {
        onPlanCreated(result.plan);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to create subscription plan");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
          <DialogDescription>
            Create a new subscription plan with pricing, limits, and features.
          </DialogDescription>
        </DialogHeader>

        <DynamicForm
          fields={fields}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
