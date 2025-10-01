import React from "react";
import FormDialog from "../form/form-dialog";
import { useSubmitMutation } from "@/hooks/use-mutate";
import { createUserAndAssignRole } from "@/actions/role/role";

export default function CreateUserRole({
  open,
  setOpen,
  roles,
  initialValues,
}) {
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Name",
      validationOptions: { required: "Name is required" },
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      validationOptions: {
        required: "Email is required",
        pattern: {
          value: /^\S+@\S+$/i,
          message: "Invalid email address",
        },
      },
    },
    {
      name: "roleId",
      type: "searchSelect",
      label: "Select Role",
      options: roles.map((role) => ({ label: role.name, value: role.id })),
      validationOptions: { required: "Role is required" },
    },
  ];

  const { mutate: handleSubmit, isPending } = useSubmitMutation({
    mutationFn: async (data) => await createUserAndAssignRole(data),
    onSuccessMessage: (message) =>
      message || "User created and role assigned successfully!",
    onClose: () => setOpen(false),
    invalidateKey: ["all-user-roles"],
  }); // Replace with actual mutation hook

  return (
    <FormDialog
      open={open}
      onClose={setOpen}
      fields={fields}
      defaultValues={initialValues}
      title="Create User Role"
      submitButtonLabel="Create User"
      description="Create a new user and assign a role."
      isLoading={isPending}
      onSubmit={handleSubmit}
    />
  );
}
