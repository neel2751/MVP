"use client";
import { DynamicForm } from "@/components/form/dynamic-form";

const testFields = [
  {
    type: "text",
    name: "propertyName",
    label: "Property Name",
    validationOptions: {
      required: "Property Name is required",
      minLength: { value: 3, message: "Minimum 3 characters" },
      maxLength: { value: 50, message: "Maximum 50 characters" },
    },
  },
  {
    type: "number",
    name: "phoneNumber",
    label: "Phone Number",
    required: true,
  },
  {
    type: "email",
    name: "ownerEmail",
    label: "Owner Email",
    required: true,
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    },
  },
  {
    type: "password",
    name: "ownerPassword",
    label: "Owner Password",
    required: true,
  },
  {
    type: "multipleSelect",
    name: "assignees",
    label: "Assignees",
    allowCreate: false, // allow creating new tags
    options: [
      { label: "John", value: "john" },
      { label: "Jane", value: "jane" },
      { label: "Mark", value: "mark" },
    ],
  },
  {
    type: "select",
    name: "propertyType",
    label: "Property Type",
    options: ["HMO", "Single", "Studio"],
    required: true,
  },
  { type: "number", name: "propertySize", label: "Property Size (sqm)" },
  { type: "date", name: "availableFrom", label: "Available From" },
  { type: "dateRange", name: "availabilityRange", label: "Availability Range" },
  { type: "file", name: "propertyFiles", label: "Property Files", maxFiles: 3 },
  {
    type: "multiGroup",
    name: "rooms",
    label: "Rooms",
    maxItem: 2,
    visibility: {
      showIf: [{ field: "propertyType", equals: "HMO" }],
    },
    fields: [
      {
        type: "text",
        name: "roomName",
        label: "Room Name",
        validationOptions: {
          required: "Room Name is required",
          minLength: { value: 2, message: "Minimum 2 characters" },
          maxLength: { value: 30, message: "Maximum 30 characters" },
        },
      },
      {
        type: "select",
        name: "roomType",
        label: "Room Type",
        options: [
          "Single",
          "Double",
          "Studio",
          "Twin",
          "En-suite",
          "Family",
          "Dormitory",
          "Accessible",
          "Luxury",
          "Budget",
        ],
        // options: [
        //   { label: "Single", value: "single" },
        //   { label: "Double", value: "double" },
        //   { label: "Studio", value: "studio" },
        //   { label: "Twin", value: "twin" },
        //   { label: "En-suite", value: "ensuite" },
        //   { label: "Family", value: "family" },
        //   { label: "Dormitory", value: "dormitory" },
        //   { label: "Accessible", value: "accessible" },
        //   { label: "Luxury", value: "luxury" },
        //   { label: "Budget", value: "budget" },
        // ],
      },
      { type: "number", name: "roomSize", label: "Size (sqm)" },
      { type: "file", name: "roomPhotos", label: "Room Photos", maxFiles: 2 },
    ],
  },
  { type: "dynamic", name: "customFields", label: "Custom Fields" },
];

export default function TestFormPage() {
  const handleSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Global Test Form</h2>
      <DynamicForm fields={testFields} onSubmit={handleSubmit} />
    </div>
  );
}
