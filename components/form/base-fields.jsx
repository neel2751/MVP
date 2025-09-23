"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import { Check, ChevronsUpDown, Calendar, Eye, EyeOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useDropzone } from "react-dropzone";
import bytes from "bytes";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BaseInput({ type = "text", value, onChange, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <Input type={actualType} value={value} onChange={onChange} {...props} />
      {isPassword && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <Eye /> : <EyeOff />}
        </Button>
      )}
    </div>
  );
}

export function BaseTextarea({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

export function BaseSelect({
  value,
  onChange,
  options = [],
  placeholder,
  className,
  ...props
}) {
  return (
    <Select value={value} onValueChange={onChange} {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function BaseRadio({
  value,
  onChange,
  options = [],
  className,
  ...props
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={className}
      {...props}
    >
      {options.map((opt) => (
        <RadioGroupItem key={opt} value={opt}>
          {opt}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

export function BaseCheckbox({
  checked,
  onChange,
  label,
  className,
  ...props
}) {
  return (
    <div className={className}>
      <Checkbox checked={checked} onCheckedChange={onChange} {...props} />
      {label && <span className="ml-2">{label}</span>}
    </div>
  );
}

export function BaseSearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((opt) => opt.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                  <Check
                    className={`ml-auto ${
                      value === opt.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function BaseDatePicker({ value, onChange, placeholder, className }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${className}`}
        >
          {value ? value.toLocaleDateString() : placeholder || "Select date"}
          <Calendar className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarComponent
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function BaseDateRangePicker({
  value = [null, null],
  onChange,
  placeholder,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${className}`}
        >
          {range[0] && range[1]
            ? `${range[0].toLocaleDateString()} - ${range[1].toLocaleDateString()}`
            : placeholder || "Select date range"}
          <Calendar className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarComponent
          mode="range"
          selected={range}
          onSelect={(val) => {
            setRange(val);
            onChange(val);
            if (val[0] && val[1]) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function BaseFileUpload({
  files = [],
  onFilesChange,
  maxFiles = 5,
  maxSize = "100MB",
  accept = ["image/*", "video/*", "application/pdf"],
}) {
  const [stagedFiles, setStagedFiles] = React.useState(files); // files not uploaded yet
  const maxBytes = bytes.parse(maxSize);

  const onDrop = React.useCallback(
    (acceptedFiles) => {
      const newFiles = [];
      for (let file of acceptedFiles) {
        if (stagedFiles.length + newFiles.length >= maxFiles) {
          toast.error(`Max files limit of ${maxFiles} reached`);
          continue;
        }

        if (file.size > maxBytes) {
          toast.error(`${file.name} exceeds max size of ${maxSize}`);
          continue;
        }

        if (!accept.some((type) => file.type.match(type))) {
          toast.error(`${file.name} is not an accepted file type`);
          continue;
        }

        newFiles.push(file);
      }

      const updatedFiles = [...stagedFiles, ...newFiles];
      setStagedFiles(updatedFiles);
      onFilesChange && onFilesChange(updatedFiles);
    },
    [stagedFiles]
  );

  const removeFile = (index) => {
    const updatedFiles = [...stagedFiles];
    updatedFiles.splice(index, 1);
    setStagedFiles(updatedFiles);
    onFilesChange && onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {stagedFiles.map((file, index) => (
          <div
            key={file.name}
            className="flex items-center justify-between border p-2 rounded"
          >
            <span>{file.name}</span>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BaseMultiGroup({
  name,
  label,
  fieldsConfig,
  renderField,
  maxItem = 5,
}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">{label}</h4>

      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded relative space-y-2">
          {fieldsConfig.map((fieldConfig) => renderField(fieldConfig, index))}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      {(!maxItem || fields.length < maxItem) && (
        <Button type="button" onClick={() => append({})}>
          Add {label}
        </Button>
      )}
    </div>
  );
}

export function BaseMultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder,
  allowCreate = false, // allow creating new tags
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const toggleOption = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const handleCreate = () => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...value, inputValue]);
      setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className="inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 w-full"
        >
          <div className="flex gap-2 flex-wrap">
            {value.length > 0 ? (
              value.map((v) => (
                <div key={v} className="flex items-center">
                  {options.find((opt) => opt.value === v)?.label || v}
                  <X
                    className="ml-1 inline-block cursor-pointer"
                    size={12}
                    onMouseDown={(e) => {
                      // stop Radix from toggling popover
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOption(v);
                    }}
                  />
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder}...`}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (allowCreate && e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                onSelect={() => toggleOption(opt.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(opt.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {opt.label}
              </CommandItem>
            ))}
            {allowCreate &&
              inputValue &&
              !options.find((o) => o.value === inputValue) && (
                <CommandItem onSelect={handleCreate}>
                  Create "{inputValue}"
                </CommandItem>
              )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
