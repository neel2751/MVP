import React from "react";
import FormDialog from "../form/form-dialog";
import { useSubmitMutation } from "@/hooks/use-mutate";
import { createPermission, updatePermission } from "@/actions/role/role";

export default function AddPermission({ open, setOpen, initialValues }) {
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Permission Name",
      validationOptions: { required: "Permission name is required" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      validationOptions: { required: "Description is required" },
    },
  ];

  const { mutate: handleSubmit, isPending } = useSubmitMutation({
    mutationFn: async (data) =>
      initialValues
        ? await updatePermission(data, initialValues.id)
        : await createPermission(data),
    onSuccessMessage: (message) =>
      message ||
      `${
        initialValues ? "Permission updated" : "Permission created"
      } successfully!`,
    invalidateKey: ["permission-list"],
    onClose: () => setOpen(false),
  });

  return (
    <FormDialog
      open={open}
      onClose={setOpen}
      defaultValues={initialValues}
      title="Add New Permission"
      fields={fields}
      isLoading={isPending}
      submitButtonLabel={
        initialValues ? "Update Permission" : "Create Permission"
      }
      onSubmit={handleSubmit}
      description={"Create a new permission to assign to roles."}
    />
  );
}
