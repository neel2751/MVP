"use client";

import { useController, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  BaseCheckbox,
  BaseDatePicker,
  BaseDateRangePicker,
  BaseFileUpload,
  BaseInput,
  BaseMultiGroup,
  BaseMultiSelect,
  BaseRadio,
  BaseSearchableSelect,
  BaseSelect,
  BaseSwitch,
  BaseTextarea,
} from "./base-fields";
import { useState } from "react";
import { Button } from "../ui/button";

export function TextInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseInput
          {...field}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
          type={fieldProps?.type || "text"}
          // disabled={fieldProps.disabled || false}
          // readOnly={fieldProps.readOnly || false}
          // step={fieldProps.type === "number" ? "any" : undefined}
          // min={fieldProps.type === "number" ? fieldProps.min : undefined}
          // max={fieldProps.type === "number" ? fieldProps.max : undefined}
          // maxLength={fieldProps.maxLength || undefined}
          // pattern={fieldProps.pattern || undefined}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function TextareaInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseTextarea
          {...field}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function SelectInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseSelect
          {...field}
          options={fieldProps?.options || []}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

export function RadioInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseRadio {...field} options={fieldProps?.options || []} />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function CheckboxInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <BaseCheckbox
        checked={field.value}
        onChange={field.onChange}
        label={fieldProps?.label}
      />
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function SearchableSelectInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseSearchableSelect
          value={field.value}
          onChange={field.onChange}
          options={fieldProps?.options || []}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function DatePickerInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseDatePicker
          value={field.value || null}
          onChange={field.onChange}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function DateRangePickerInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseDateRangePicker
          value={field.value || [null, null]}
          onChange={field.onChange}
          placeholder={fieldProps?.placeholder || fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

export function FileUploadInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseFileUpload
          files={field.value || []}
          onFilesChange={field.onChange}
          maxFiles={fieldProps?.maxFiles || 5}
          maxSize={fieldProps?.maxSize || "100MB"}
          accept={
            fieldProps?.accept || ["image/*", "video/*", "application/pdf"]
          }
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}

const fieldTypeMap = {
  text: TextInput,
  select: SelectInput,
  date: DatePickerInput,
  file: FileUploadInput,
};

export function MultiGroupInput({ name, label, fieldsConfig, maxItem }) {
  const methods = useFormContext();

  const renderField = (fieldConfig, index) => {
    const Component = fieldTypeMap[fieldConfig.type];
    if (!Component) return null;

    return (
      <Component
        key={fieldConfig.name}
        name={`${name}.${index}.${fieldConfig.name}`}
        control={methods.control}
        fieldProps={fieldConfig}
      />
    );
  };

  return (
    <BaseMultiGroup
      name={name}
      label={label}
      fieldsConfig={fieldsConfig}
      renderField={renderField}
      maxItem={maxItem || 5}
    />
  );
}

export function DynamicFields({ name, label, maxFields = 5 }) {
  const { control } = useFormContext();
  const [fields, setFields] = useState([]); // { name, type, value, options }

  const addField = () => {
    setFields([...fields, { name: "", type: "text", value: "", options: [] }]);
  };

  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  return (
    <div className="space-y-4 border p-4 rounded">
      <h4 className="font-semibold">{label}</h4>

      {fields.map((field, index) => {
        const Component = fieldTypeMap[field.type] || TextInput;
        return (
          <div key={index} className="flex items-center space-x-2">
            {/* Field Name Input */}
            <TextInput
              name={`${name}.${index}.fieldName`}
              control={control}
              label="Field Name"
              value={field.name}
              onChange={(val) => updateField(index, "name", val)}
            />

            {/* Field Type Select */}
            <SelectInput
              name={`${name}.${index}.fieldType`}
              control={control}
              label="Type"
              options={Object.keys(fieldTypeMap)}
              value={field.type}
              onChange={(val) => updateField(index, "type", val)}
            />

            {/* Field Value Input */}
            <Component
              name={`${name}.${index}.value`}
              control={control}
              label="Value"
              value={field.value}
              onChange={(val) => updateField(index, "value", val)}
              options={field.options}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => removeField(index)}
            >
              Remove
            </Button>
          </div>
        );
      })}
      {fields.length < maxFields && (
        <Button type="button" onClick={addField}>
          Add Field
        </Button>
      )}
    </div>
  );
}

export function FormMultipleSelect({ fieldProps, control }) {
  const { field: inputField, fieldState } = useController({
    name: fieldProps.name,
    control: control,
    rules: fieldProps.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps.label}</FormLabel>
      <FormControl>
        <BaseMultiSelect
          value={inputField.value || []}
          onChange={inputField.onChange}
          options={fieldProps.options || []}
          placeholder={
            fieldProps.placeholder || fieldProps.label || "Select options"
          }
          allowCreate={fieldProps.allowCreate || false}
        />
      </FormControl>
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

export function FormMultipleInput({ fieldProps, control }) {
  const { field: inputField, fieldState } = useController({
    name: fieldProps.name,
    control: control,
    rules: fieldProps.validationOptions,
  });

  const [items, setItems] = useState(inputField.value || []);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() && items.length < (fieldProps.maxItems || 10)) {
      // duplicate items are not allowed
      if (items.includes(newItem.trim())) {
        setNewItem("");
        return;
      }
      const updatedItems = [...items, newItem.trim()];
      setItems(updatedItems);
      inputField.onChange(updatedItems);
      setNewItem("");
    }
  };

  const removeItem = (item) => {
    const updatedItems = items.filter((i) => i !== item);
    setItems(updatedItems);
    inputField.onChange(updatedItems);
  };

  return (
    <FormItem>
      <FormLabel>{fieldProps.label}</FormLabel>
      <div className="space-y-2">
        <div className="flex gap-2">
          <BaseInput
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={fieldProps.placeholder || `Add ${fieldProps.label}`}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addItem())
            }
          />
          <Button type="button" onClick={addItem}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 bg-accent px-2 py-1 rounded-sm text-xs font-medium"
            >
              {item}
              <button
                type="button"
                className="ml-1 text-red-500"
                onClick={() => removeItem(item)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

export function FormSwitchInput({ control, name, fieldProps }) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: fieldProps?.validationOptions,
  });

  return (
    <FormItem>
      <FormLabel>{fieldProps?.label}</FormLabel>
      <FormControl>
        <BaseSwitch
          checked={field.value}
          onChange={field.onChange}
          label={fieldProps?.label}
        />
      </FormControl>
      <FormMessage>{fieldState?.error?.message}</FormMessage>
    </FormItem>
  );
}
