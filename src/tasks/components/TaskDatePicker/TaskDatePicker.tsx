import * as Popover from "@radix-ui/react-popover";
import dayjs from "dayjs";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { cn } from "src/common/utils/cn";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";

type TaskDatePickerProps = {
  dueDate: Dayjs | null;
  colour?: Colour;
  isCompleted?: boolean;
  isCancelled?: boolean;
  onChange: (date: Dayjs | null) => void;
  onOpenChange?: (open: boolean) => void;
};

export const TaskDatePicker = ({
  dueDate,
  colour = colours.orange,
  isCompleted = false,
  isCancelled = false,
  onChange,
  onOpenChange,
}: TaskDatePickerProps) => {
  const today = dayjs();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const isOverdue =
    dueDate && dueDate.isBefore(today, "day") && !isCompleted && !isCancelled;

  const trigger = dueDate ? (
    <button
      type="button"
      className={cn(
        "text-xs px-2 py-1 rounded-full transition-colors",
        isOverdue ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500",
      )}
    >
      {dueDate.format("MMM D, YYYY")}
    </button>
  ) : (
    <Button colour={colour} iconName="calendarDots" variant="ghost" size="sm" />
  );

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50"
          sideOffset={6}
          align="center"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ControlPopover
            className="p-3 w-52"
            clearActionLabel={dueDate ? "Clear date" : undefined}
            onClearAction={
              dueDate
                ? () => {
                    onChange(null);
                    handleOpenChange(false);
                  }
                : undefined
            }
          >
            <Calendar
              colour={colour}
              selectedDate={dueDate}
              onSelectDate={(date) => {
                onChange(date);
                handleOpenChange(false);
              }}
            />
          </ControlPopover>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
