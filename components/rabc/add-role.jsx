import React from "react";
import FormDialog from "../form/form-dialog";
import { useSubmitMutation } from "@/hooks/use-mutate";
import { createRole, updateRole } from "@/actions/role/role";

export default function AddRole({ open, setOpen, initialValues }) {
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Role Name",
      validationOptions: { required: "Role name is required" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      validationOptions: { required: "Description is required" },
    },
    {
      name: "isGlobal",
      type: "switch",
      label: "Is Global Role",
      validationOptions: {},
    },
  ];

  const { mutate: handleSubmit, isPending } = useSubmitMutation({
    mutationFn: async (data) =>
      initialValues
        ? await updateRole(data, initialValues.id)
        : await createRole(data),
    onSuccessMessage: (message) =>
      message ||
      `${initialValues ? "Role updated" : "Role created"} successfully!`,
    invalidateKey: ["roles-list"],
    onClose: () => setOpen(false),
  });

  return (
    <FormDialog
      open={open}
      onClose={setOpen}
      defaultValues={initialValues}
      title="Add New Role"
      fields={fields}
      isLoading={isPending}
      submitButtonLabel={initialValues ? "Update Role" : "Create Role"}
      onSubmit={handleSubmit}
      description={"Create a new role with specific permissions."}
    />
  );
}
