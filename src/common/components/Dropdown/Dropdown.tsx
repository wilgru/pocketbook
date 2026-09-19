import { CaretRight, Check } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "cn";
import type { Colour } from "src/colours/Colour.type";

type DropdownProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
  "children"
>;

export const Dropdown = ({
  children,
  className,
  ...contentProps
}: DropdownProps) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          "flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-1.5 drop-shadow-sm",
          className,
        )}
        {...contentProps}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
};

type DropdownItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> & {
  subText?: string;
  colour?: Colour;
};

export const DropdownItem = ({
  className,
  children,
  subText,
  colour,
  ...props
}: DropdownItemProps) => {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "cursor-pointer rounded-md px-2 py-1 text-sm leading-none outline-hidden transition-colors",
        colour && `data-[highlighted]:${colour.primary.background}`,
        colour && `data-[highlighted]:${colour.primary.text}`,
        className,
      )}
      {...props}
    >
      {subText ? (
        <div className="flex flex-col gap-0.5">
          {children}
          <span className="text-xs font-normal text-slate-400">{subText}</span>
        </div>
      ) : (
        children
      )}
    </DropdownMenuPrimitive.Item>
  );
};

type DropdownLabelProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
>;

export const DropdownLabel = ({
  className,
  children,
  ...props
}: DropdownLabelProps) => {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("pt-2 pl-2 text-xs text-slate-400", className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
};

type DropdownSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

export const DropdownSeparator = ({
  className,
  ...props
}: DropdownSeparatorProps) => {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 border-t border-slate-200", className)}
      {...props}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const DropdownSub = DropdownMenuPrimitive.Sub;

type DropdownSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  colour?: Colour;
  subText?: string;
};

export const DropdownSubTrigger = ({
  className,
  children,
  colour,
  subText,
  ...props
}: DropdownSubTriggerProps) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm leading-none outline-hidden transition-colors select-none",
        colour && `data-[highlighted]:${colour.primary.background}`,
        colour && `data-[highlighted]:${colour.primary.text}`,
        colour && `data-[state=open]:${colour.primary.background}`,
        colour && `data-[state=open]:${colour.primary.text}`,
        className,
      )}
      {...props}
    >
      {subText ? (
        <div className="flex flex-col gap-0.5">
          {children}
          <span className="text-xs font-normal text-slate-400">{subText}</span>
        </div>
      ) : (
        children
      )}
      <CaretRight size={12} />
    </DropdownMenuPrimitive.SubTrigger>
  );
};

type DropdownSubContentProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>,
  "children"
>;

export const DropdownSubContent = ({
  children,
  className,
  sideOffset = 2,
  ...contentProps
}: DropdownSubContentProps) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        sideOffset={sideOffset}
        className={cn(
          "flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-1.5 drop-shadow-sm",
          className,
        )}
        {...contentProps}
      >
        {children}
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
};

type DropdownRadioGroupProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioGroup
>;

export const DropdownRadioGroup = ({
  children,
  ...props
}: DropdownRadioGroupProps) => {
  return (
    <DropdownMenuPrimitive.RadioGroup {...props}>
      {children}
    </DropdownMenuPrimitive.RadioGroup>
  );
};

type DropdownRadioItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
> & {
  colour?: Colour;
};

export const DropdownRadioItem = ({
  className,
  children,
  colour,
  ...props
}: DropdownRadioItemProps) => {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-sm leading-none outline-hidden transition-colors",
        colour && `data-[highlighted]:${colour.primary.background}`,
        colour && `data-[highlighted]:${colour.primary.text}`,
        className,
      )}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator>
        <Check />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
};
