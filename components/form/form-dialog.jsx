import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DynamicForm } from "./dynamic-form";

export default function FormDialog({
  open,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  defaultValues,
  isLoading,
  submitButtonLabel,
  className,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DynamicForm
          fields={fields}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          isLoading={isLoading}
          submitButtonLabel={submitButtonLabel}
        />
      </DialogContent>
    </Dialog>
  );
}
