import { useEffect, useRef, useState } from "react";

export function useDependentOptions(field, methods) {
  const [options, setOptions] = useState(field.options || []);
  const prevValues = useRef([]);
  // options in the form of [{label, value}, ...]

  useEffect(() => {
    if (field.dependField && typeof field.loadOptions === "function") {
      const dependFields = Array.isArray(field.dependField)
        ? field.dependField
        : [field.dependField];

      const allValues = methods.watch(); // all values
      const dependValues = dependFields.map((key) => allValues[key]);

      const hasChanged = dependValues.some(
        (val, i) => val !== prevValues.current[i]
      );

      if (hasChanged) {
        // reset main field value
        methods.setValue(field.name, "");

        // call loadOptions
        field.loadOptions(
          dependFields.length === 1
            ? dependValues[0]
            : Object.fromEntries(
                dependFields.map((k, i) => [k, dependValues[i]])
              )
        );

        prevValues.current = dependValues;
      }
      dependFields.map((key) => methods.watch(key));
    }
  }, [methods.watch(field.dependField)]);

  return options;
}
