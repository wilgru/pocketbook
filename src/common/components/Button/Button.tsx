import { cva } from "class-variance-authority";
import { forwardRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";

type ButtonProps = {
  children?: React.ReactNode;
  variant?: "block" | "ghost" | "ghost-strong" | "link";
  colour?: Colour;
  size?: "xs" | "sm" | "md" | "lg";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  iconName?: string;
  ariaLabel?: string;
};

const buttonVariants = cva(
  [
    "h-fit",
    "w-fit",
    "flex",
    "items-center",
    "rounded-full",
    "transition-colors",
    "focus-visible:outline-solid",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-orange-500",
  ],
  {
    variants: {
      variant: {
        block: null,
        ghost: "text-slate-500",
        "ghost-strong": "text-slate-400",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        xs: "text-[0.625rem] font-normal gap-1",
        sm: "text-xs font-normal gap-1.5",
        md: "text-sm font-medium gap-2",
        lg: "text-md font-medium gap-3",
      },
      content: {
        text: null,
        icon: null,
        iconAndText: null,
      },
    },
    compoundVariants: [
      // text only
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "text",
        size: "xs",
        className: "py-0.5 px-1",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "text",
        size: "sm",
        className: "py-1 px-2",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "text",
        size: "md",
        className: "py-2 px-3",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "text",
        size: "lg",
        className: "py-3 px-4",
      },
      // icons only
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "xs",
        className: "p-0.5",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "sm",
        className: "p-1",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "md",
        className: "p-2",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "lg",
        className: "p-3",
      },
      //  icons and text
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "xs",
        className: "py-0.5 pl-1 pr-1.5",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "sm",
        className: "py-1 pl-1.5 pr-2",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "md",
        className: "py-2 pl-2 pr-3",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "lg",
        className: "py-3 pl-3 pr-4",
      },
    ],
    defaultVariants: {
      variant: "block",
      size: "md",
    },
  },
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      type = "button",
      variant = "block",
      size = "md",
      colour = colours.orange,
      className,
      disabled = false,
      onClick,
      iconName,
      ariaLabel,
    },
    ref,
  ) => {
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const content =
      iconName && children
        ? "iconAndText"
        : iconName && !children
          ? "icon"
          : "text";

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({
            size,
            variant,
            content,
          }),
          variant === "block" && colour.textPill,
          variant === "block" && colour.backgroundPill,
          variant === "block" && colour.textPillInverted,
          variant === "block" && colour.backgroundPillInverted,
          variant === "ghost" && !disabled && `hover:${colour.textPill}`,
          variant === "ghost" && !disabled && `hover:${colour.backgroundPill}`,
          variant === "ghost-strong" && !disabled && `hover:${colour.textPill}`,
          variant === "ghost-strong" &&
            !disabled &&
            `hover:${colour.backgroundPill}`,
          className,
        )}
        disabled={disabled}
        aria-label={ariaLabel}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        onClick={onClick}
      >
        {iconName && (
          <Icon
            iconName={iconName}
            size={size}
            className={cn(isButtonHovered && colour.textPill)}
            weight={isButtonHovered ? "fill" : "regular"}
          />
        )}
        {children}
      </button>
    );
  },
);
