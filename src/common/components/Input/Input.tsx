import { cn } from "src/common/utils/cn";
import type { HTMLInputTypeAttribute } from "react";

type InputType = {
  id?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  value: string;
  placeholder?: string;
  size?: "xs" | "md" | "lg";
  onChange: (e: { target: { name: string; value: string } }) => void;
};

enum InputSize {
  "xs" = "px-1 py-0.5 text-xs",
  "md" = "p-1 text-sm",
  "lg" = "p-2 text-md",
}

export const Input = ({
  id,
  size = "md",
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
}: InputType): JSX.Element => {
  return (
    <input
      required={required}
      id={id}
      name={type}
      type={type}
      autoComplete={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "block w-full bg-white rounded-md border border-slate-300 placeholder:text-slate-400",
        InputSize[size],
      )}
    />
  );
};
