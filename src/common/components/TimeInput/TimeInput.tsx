import { cn } from "src/common/utils/cn";

type TimePeriod = "AM" | "PM";

type TimeInputProps = {
  hour: string;
  minute: string;
  period: TimePeriod;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onChange: (value: {
    hour: string;
    minute: string;
    period: TimePeriod;
  }) => void;
};

const inputClassName = cn(
  "rounded-md border border-slate-300 bg-white px-1 py-0.5 text-center text-[10px] text-slate-700",
  "focus:border-slate-400 focus:outline-hidden",
  "disabled:cursor-not-allowed disabled:text-slate-300",
);

export const TimeInput = ({
  hour,
  minute,
  period,
  disabled = false,
  className,
  ariaLabel = "Time",
  onChange,
}: TimeInputProps): JSX.Element => {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-0.5 text-xs", className)}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        placeholder="12"
        value={hour}
        disabled={disabled}
        aria-label="Hour"
        onChange={(event) =>
          onChange({ hour: event.target.value, minute, period })
        }
        className={cn(
          inputClassName,
          "w-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />

      <span className="text-[10px] text-slate-400" aria-hidden="true">
        :
      </span>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        placeholder="00"
        value={minute}
        disabled={disabled}
        aria-label="Minute"
        onChange={(event) =>
          onChange({ hour, minute: event.target.value, period })
        }
        className={cn(
          inputClassName,
          "w-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />

      <select
        value={period}
        disabled={disabled}
        aria-label="AM or PM"
        onChange={(event) =>
          onChange({
            hour,
            minute,
            period: event.target.value as TimePeriod,
          })
        }
        className={cn(inputClassName, "w-12 text-left pr-1", "focus:bg-white")}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};
