"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { deleteSubscriptionPlan } from "@/actions/plan/subscription-plan";

export function DeleteSubscriptionPlanDialog({
  open,
  onOpenChange,
  plan,
  onPlanDeleted,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await deleteSubscriptionPlan(plan.id);

      if (result.success) {
        onPlanDeleted(plan.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete subscription plan");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Subscription Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the "{plan.name}" subscription plan?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Deleting this subscription plan will affect all companies currently
            subscribed to it. Make sure to migrate existing subscribers to
            another plan first.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
