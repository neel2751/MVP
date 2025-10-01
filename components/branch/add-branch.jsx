import React from "react";
import { createRole, updateRole } from "@/actions/role/role";
import { useSubmitMutation } from "@/hooks/use-mutate";
import FormDialog from "@/components/form/form-dialog";

export default function AddBranch({ open, setOpen, initialValues }) {
  const fields = [
    {
      name: "name",
      type: "text",
      label: "Branch Name",
      validationOptions: { required: "Branch name is required" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      validationOptions: { required: "Description is required" },
    },
    // if they subdomain or domain
    {
      name: "ownDomain",
      type: "switch",
      label: "Own Domain",
      validationOptions: {},
    },
    // make show if ownDomain is true
    {
      name: "domain",
      type: "text",
      label: "Domain",
      validationOptions: { required: "Domain is required" },
      visibility: {
        showIf: [{ field: "ownDomain", equals: true }],
      },
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
      title="Add New Branch"
      fields={fields}
      isLoading={isPending}
      submitButtonLabel={initialValues ? "Update Branch" : "Create Branch"}
      onSubmit={handleSubmit}
      description={"Create a new branch with specific details."}
    />
  );
}
