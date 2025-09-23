import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

import { useEffect, useRef } from "react";
import {
  CheckboxInput,
  DatePickerInput,
  MultiGroupInput,
  RadioInput,
  SearchableSelectInput,
  TextareaInput,
  TextInput,
} from "./form-fields";

function checkConditions(conditions, watchedValues, logic = "AND") {
  if (!conditions || conditions.length === 0) return true;
  const results = conditions.map((c) => {
    const value = watchedValues[c.field];
    return c.equals !== undefined ? value === c.equals : true;
  });
  return logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

export function GlobalForm({
  fields,
  initialValues,
  onSubmit,
  isLoading,
  btnName,
  resetForm = true, // Whether to reset form after submission
  isHide = false, // Whether to hide the submit button
  ExtraButton, // Optional extra button component
}) {
  const method = useForm({
    mode: "onBlur",
    defaultValues: initialValues || {},
    shouldUnregister: true,
  });

  // Reset form values after form submission
  useEffect(() => {
    if (resetForm) {
      method.reset();
    }
  }, [resetForm]);

  fields.forEach((field) => {
    if (field.dependField && typeof field.function === "function") {
      const dependFields = Array.isArray(field.dependField)
        ? field.dependField
        : [field.dependField];

      const prevValues = useRef([]);

      useEffect(
        () => {
          const allValues = method.watch(); // get all form values
          const dependValues = dependFields.map((key) => allValues[key]);

          // Only run if value has changed
          const hasChanged = dependValues.some(
            (val, i) => val !== prevValues.current[i]
          );

          if (hasChanged) {
            // ✅ Reset the main field's value
            method.setValue(field.name, "");

            // ✅ Trigger the dependent function
            field.function(
              dependFields.length === 1
                ? dependValues[0]
                : Object.fromEntries(
                    dependFields.map((k, i) => [k, dependValues[i]])
                  )
            );

            // Update previous values
            prevValues.current = dependValues;
          }
        },
        dependFields.map((key) => method.watch(key))
      ); // dependencies
    }
  });

  // Watch the field values that are used for conditional rendering
  const watchField = useWatch({ control: method.control });

  // First: filter only visible fields
  const visibleFields = fields.filter((field) => {
    if (field?.visibility?.showIf) {
      return checkConditions(
        field.visibility.showIf,
        watchField,
        field.visibility.logic || "AND"
      );
    }

    if (field?.visibility?.hideIf) {
      return !checkConditions(
        field.visibility.hideIf,
        watchField,
        field.visibility.logic || "AND"
      );
    }

    return true;
  });

  console.log("Visible Fields:", visibleFields);

  const groupedFields = [];

  for (let i = 0; i < visibleFields.length; ) {
    const current = visibleFields[i];

    if (current.size) {
      // full-width field
      groupedFields.push([current]);
      i++;
    } else {
      const next = visibleFields[i + 1];
      if (next && !next.size) {
        // two half-width fields
        groupedFields.push([current, next]);
        i += 2;
      } else {
        // one half-width field, no pair
        groupedFields.push([current]);
        i++;
      }
    }
  }

  return (
    <FormProvider {...method}>
      <form onSubmit={method.handleSubmit(onSubmit)} className="space-y-3">
        {groupedFields.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={
              visibleFields.length === 1
                ? "grid grid-cols-1"
                : "grid grid-cols-6 gap-4"
            }
          >
            {row.map((field, index) => (
              <div
                key={index}
                className={`col-span-6 ${
                  field.size || row.length === 1
                    ? "sm:col-span-6"
                    : "sm:col-span-3"
                }`}
              >
                {(field.type === "text" ||
                  field.type === "email" ||
                  field.type === "password" ||
                  field.type === "tel" ||
                  field.type === "number") && (
                  <TextInput key={field?.name} field={field} />
                )}
                {field.type === "select" && (
                  <SearchableSelectInput key={field?.name} field={field} />
                )}
                {field.type === "multipleSelect" && (
                  <FormMultipleSelect key={field?.name} field={field} />
                )}
                {field.type === "radio" && (
                  <RadioInput key={field?.name} field={field} />
                )}
                {field.type === "checkbox" && (
                  <CheckboxInput key={field?.name} field={field} />
                )}
                {field.type === "textarea" && (
                  <TextareaInput key={field?.name} field={field} />
                )}
                {field.type === "date" && (
                  <DatePickerInput key={field?.name} field={field} />
                )}
                {field.type === "multiGroup" && (
                  <MultiGroupInput key={field.name} field={field} />
                )}
                {field.type === "image" && (
                  <FileUploadInput key={field.name} field={field} />
                )}
              </div>
            ))}
          </div>
        ))}
        {!isHide && (
          <div
            className={`mt-7 ${
              ExtraButton ? "flex justify-between" : "text-end"
            }`}
          >
            {ExtraButton && ExtraButton}
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>
                  {btnName ? btnName : !initialValues ? "Submit" : "Update"}
                </span>
              )}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
