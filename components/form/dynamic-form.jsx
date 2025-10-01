"use client";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  CheckboxInput,
  DatePickerInput,
  DateRangePickerInput,
  DynamicFields,
  FileUploadInput,
  FormMultipleInput,
  FormMultipleSelect,
  FormSwitchInput,
  MultiGroupInput,
  SearchableSelectInput,
  SelectInput,
  TextareaInput,
  TextInput,
} from "./form-fields";
import { useDependentOptions } from "@/hooks/use-depedentOptions";

const fieldTypeMap = {
  text: TextInput,
  email: TextInput,
  number: TextInput,
  password: TextInput,
  tel: TextInput,
  textarea: TextareaInput,
  select: SelectInput,
  date: DatePickerInput,
  dateRange: DateRangePickerInput,
  file: FileUploadInput,
  multiGroup: MultiGroupInput,
  dynamic: DynamicFields,
  multipleSelect: FormMultipleSelect,
  checkbox: CheckboxInput,
  multipleInput: FormMultipleInput,
  switch: FormSwitchInput,
  searchSelect: SearchableSelectInput,
};

function checkConditions(conditions, watchedValues, logic = "AND") {
  if (!conditions || conditions.length === 0) return true;
  const results = conditions.map((c) => {
    const value = watchedValues[c.field];
    return c.equals !== undefined ? value === c.equals : true;
  });
  return logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

export function DynamicForm({
  fields = [],
  defaultValues = {},
  onSubmit,
  submitButtonLabel = "Submit",
  isLoading = false,
}) {
  const methods = useForm({ mode: "onBlur", defaultValues });
  const { control } = methods;

  const renderField = (field) => {
    // dynamic option handling
    const options = useDependentOptions(field, methods);
    if (
      field.type === "select" &&
      field.type === "searchSelect" &&
      options.length > 0
    ) {
      field.options = options;
    }

    // handle show/hide logic
    const watchedValues = useWatch({ control });
    let isVisible = true;
    if (field?.visibility?.showIf) {
      isVisible = checkConditions(
        field.visibility.showIf,
        watchedValues,
        field.visibility.logic || "AND"
      );
    }
    if (field?.visibility?.hideIf) {
      isVisible = !checkConditions(
        field.visibility.hideIf,
        watchedValues,
        field.visibility.logic || "AND"
      );
    }
    if (!isVisible) return null;

    const Component = fieldTypeMap[field.type];
    if (!Component) return null;

    const rules = {};

    // Required validation
    if (field.required) {
      rules.required = `${field.label || field.name} is required`;
    }

    // Pattern validation
    if (field.pattern) {
      rules.pattern = {
        value: field.pattern.value,
        message:
          field.pattern.message || `${field.label || field.name} is invalid`,
      };
    }

    switch (field.type) {
      case "multiGroup":
        return (
          <Component
            key={field.name}
            name={field.name}
            label={field.label}
            fieldsConfig={field.fields}
            maxItem={field.maxItem || 10}
          />
        );
      case "dynamic":
        return (
          <Component
            key={field.name}
            name={field.name}
            label={field.label}
            maxItem={field.maxItem}
          />
        );
      default:
        return (
          <Component
            key={field.name}
            name={field.name}
            control={methods.control}
            fieldProps={field}
          />
        );
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map(renderField)}
        <Button disabled={isLoading} isLoading={isLoading} type="submit">
          {submitButtonLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
