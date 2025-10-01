"use client";
import { DynamicForm } from "@/components/form/dynamic-form";
import api from "@/hooks/use-axios";
import React from "react";

const superAdminFields = [
  {
    name: "name",
    type: "text",
    label: "Name",
    validationOptions: { required: "Name is required", minLength: 3 },
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validationOptions: {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email address",
      },
    },
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    validationOptions: {
      required: "Password is required",
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters long",
      },
    },
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    validationOptions: {
      required: "Please confirm your password",
      validate: (value, formValues) =>
        value === formValues.password || "Passwords do not match",
    },
  },
];

export default function Page() {
  const handleSubmit = async (data) => {
    // we have to send data to backend to create super admin account
    try {
      const response = await api.post(
        "http://localhost:3000/api/superadmin/register",
        data
      );
      console.log("Super admin account created", response.data);
    } catch (error) {
      console.error("Error creating super admin account", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Super Admin Registration
        </h2>
        <DynamicForm fields={superAdminFields} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
