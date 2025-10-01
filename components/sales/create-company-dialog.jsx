"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DynamicForm } from "../form/dynamic-form";
import { useSelectSubscriptionPlan } from "@/hooks/useSelect/use-select";
import { createCompany } from "@/actions/company/company";
import React from "react";

export function CreateCompanyDialog({ open, onOpenChange, onCompanyCreated }) {
  const plans = useSelectSubscriptionPlan();
  const [selectedPlans, setSelectedPlans] = React.useState([]);
  const checkPlan = (value) => {
    if (value === "Monthly") {
      setSelectedPlans(
        plans.map((plan) => ({
          value: plan.value,
          label: `${plan.label} - £${plan.monthlyPrice}/month`,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
        }))
      );
    } else if (value === "Yearly") {
      setSelectedPlans(
        plans.map((plan) => ({
          value: plan.value,
          label: `${plan.label} - £${plan.yearlyPrice}/year`,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
        }))
      );
    }
    return [];
  };

  const fields = [
    {
      name: "name",
      label: "Company Name",
      type: "text",
      placeholder: "ABC Property Management",
      validationOptions: { required: "Company name is required" },
    },
    {
      name: "adminName",
      label: "Your Name",
      type: "text",
      placeholder: "John Doe",
      validationOptions: { required: "Name is required" },
    },
    {
      name: "adminEmail",
      label: "Email",
      type: "email",
      placeholder: "johndoe@example.com",
      validationOptions: { required: "Email is required" },
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "123 Business Street",
      validationOptions: { required: "Address is required" },
    },
    {
      name: "city",
      label: "City",
      type: "text",
      placeholder: "London",
      validationOptions: { required: "City is required" },
    },
    {
      name: "postcode",
      label: "Postcode",
      type: "text",
      placeholder: "SW1A 1AA",
      validationOptions: { required: "Postcode is required" },
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "+44 20 1234 5678",
    },
    {
      name: "domain",
      label: "Domain",
      type: "text",
      placeholder: "https://company.com",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "inactive", label: "Inactive" },
        { value: "renewal", label: "Renewal" },
        { value: "cancelled", label: "Cancelled" },
        { value: "rejected", label: "Rejected" },
        { value: "archived", label: "Archived" },
      ],
      validationOptions: { required: "Status is required" },
    },
    {
      name: "planType",
      label: "Plan Type",
      type: "searchSelect",
      options: [
        { value: "Monthly", label: "Monthly" },
        { value: "Yearly", label: "Yearly" },
      ],
      defaultValue: "monthly",
      validationOptions: { required: "Plan type is required" },
    },
    {
      name: "subscriptionPlan",
      labelText: "Subscription Plan",
      type: "select",
      options: selectedPlans,
      dependField: "planType",
      loadOptions: checkPlan,
      validationOptions: { required: "Subscription plan is required" },
    },
  ];

  const handleSubmit = async (data) => {
    try {
      const result = await createCompany(data);

      console.log("Create company result:", result);

      if (result.success) {
        onCompanyCreated(result.company);
        onOpenChange(false);
        toast.success("Company created successfully.");
      } else {
        toast.error(result.error || "Failed to create company");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Create a new company (agency) that can manage properties and
            tenants.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm fields={fields} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
