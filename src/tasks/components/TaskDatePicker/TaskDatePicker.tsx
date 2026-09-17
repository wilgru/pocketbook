import dayjs from "dayjs";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { TimeInput } from "src/common/components/TimeInput/TimeInput";
import { cn } from "src/common/utils/cn";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";

type TimeValue = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

type TaskDatePickerProps = {
  dueDate: Dayjs | null;
  colour?: Colour;
  isCompleted?: boolean;
  isCancelled?: boolean;
  showTimeInput?: boolean;
  onChange: (date: Dayjs | null) => void;
  onOpenChange?: (open: boolean) => void;
};

const DEFAULT_TIME_VALUE: TimeValue = {
  hour: "12",
  minute: "00",
  period: "AM",
};

const getTimeValue = (date: Dayjs | null): TimeValue => {
  if (!date) {
    return DEFAULT_TIME_VALUE;
  }

  const hour = date.hour();
  const minute = String(date.minute()).padStart(2, "0");
  const isPm = hour >= 12;
  const twelveHour = hour % 12 || 12;

  return {
    hour: String(twelveHour),
    minute,
    period: isPm ? "PM" : "AM",
  };
};

const applyTimeValue = (date: Dayjs, timeValue: TimeValue) => {
  const parsedHour = Number(timeValue.hour);
  const parsedMinute = Number(timeValue.minute);
  const safeHour = Number.isNaN(parsedHour) ? 12 : parsedHour;
  const safeMinute = Number.isNaN(parsedMinute) ? 0 : parsedMinute;
  const hour = timeValue.period === "PM" ? (safeHour % 12) + 12 : safeHour % 12;

  return date.hour(hour).minute(safeMinute);
};

export const TaskDatePicker = ({
  dueDate,
  colour = colours.orange,
  isCompleted = false,
  isCancelled = false,
  showTimeInput = false,
  onChange,
  onOpenChange,
}: TaskDatePickerProps) => {
  const today = dayjs();
  const [isOpen, setIsOpen] = useState(false);
  const [draftTimeValue, setDraftTimeValue] =
    useState<TimeValue>(DEFAULT_TIME_VALUE);
  const timeValue = dueDate ? getTimeValue(dueDate) : draftTimeValue;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (!date) {
      onChange(null);
      return;
    }

    onChange(showTimeInput ? applyTimeValue(date, timeValue) : date);
  };

  const isOverdue =
    dueDate && dueDate.isBefore(today, "day") && !isCompleted && !isCancelled;

  const trigger = dueDate ? (
    <button
      type="button"
      className={cn(
        "text-[11px] px-2 py-0.5 rounded-full transition-colors",
        isOverdue ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500",
      )}
    >
      {dueDate.format("MMM D, YYYY")}
    </button>
  ) : (
    <Button colour={colour} iconName="calendarDots" variant="ghost" size="xs" />
  );

  return (
    <ControlPopover
      open={isOpen}
      onOpenChange={handleOpenChange}
      onOpenAutoFocus={(event) => event.preventDefault()}
      trigger={trigger}
      className="p-3 w-52"
      clearActionLabel={dueDate ? "Clear date" : undefined}
      onClearAction={dueDate ? () => handleDateChange(null) : undefined}
    >
      <div className="flex flex-col gap-2">
        <Calendar
          colour={colour}
          selectedDate={dueDate}
          onSelectDate={(date) => {
            handleDateChange(date);
          }}
        />

        {showTimeInput && (
          <div className="border-t border-slate-100 pt-2">
            <TimeInput
              hour={timeValue.hour}
              minute={timeValue.minute}
              period={timeValue.period}
              ariaLabel="Due time"
              onChange={(nextTimeValue) => {
                setDraftTimeValue(nextTimeValue);

                if (dueDate) {
                  onChange(applyTimeValue(dueDate, nextTimeValue));
                }
              }}
            />
          </div>
        )}
      </div>
    </ControlPopover>
  );
};
