"use client";
import React from "react";
import { DynamicForm } from "../form/dynamic-form";
import { toast } from "sonner";
import { login } from "@/actions/auth-actions";

export default function LoginForm() {
  const fields = [
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
  ];

  const handleSubmit = async (data) => {
    try {
      const res = await login(data);
      if (res?.error || res?.code) {
        toast.error(
          res.error || "Login failed. Please check your credentials."
        );
      } else {
        toast.success("Login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred while logging in.");
    }
  };

  return (
    <DynamicForm
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonLabel="Login"
    />
  );
}
