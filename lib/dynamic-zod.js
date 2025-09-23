import { z } from "zod";

/**
 * Generate dynamic Zod schema for basic field types
 * @param {Array} fields - Array of field objects { name, type, required }
 * @returns Zod schema object
 */
export function generateZodSchema(fields) {
  const shape = {};

  fields.forEach((field) => {
    let schema;
    switch (field.type) {
      case "text":
      case "textarea":
        schema = z.string();
        if (field.required)
          schema = schema.min(1, `${field.label} is required`);
        break;
      case "select":
      case "radio":
        schema = z.string();
        if (field.required)
          schema = schema.min(1, `${field.label} is required`);
        break;
      case "checkbox":
        schema = z.boolean();
        if (field.required)
          schema = schema.refine(
            (val) => val === true,
            `${field.label} is required`
          );
        break;
      default:
        schema = z.any();
    }
    shape[field.name] = schema;
  });

  return z.object(shape);
}
