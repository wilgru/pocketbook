import dayjs from "dayjs";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";

type CalendarProps = {
  colour?: Colour;
  selectedDate?: Dayjs | null;
  showSelectedDate?: boolean;
  onSelectDate?: (date: Dayjs) => void;
  isDateDisabled?: (date: Dayjs) => boolean;
  dayDotIndicators?: Record<
    string,
    Array<{ colourClassName: string; count: number }>
  >;
};

type CalendarDay = {
  day: Dayjs;
  isCurrentMonth: boolean;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MAX_VISIBLE_DOTS = 4;

export const Calendar = ({
  colour = colours.orange,
  selectedDate,
  showSelectedDate = true,
  onSelectDate,
  isDateDisabled,
  dayDotIndicators,
}: CalendarProps): JSX.Element => {
  const today = dayjs();
  const [displayYear, setDisplayYear] = useState(today.year());
  const [displayMonth, setDisplayMonth] = useState(today.month());

  const firstDay = dayjs().year(displayYear).month(displayMonth).date(1).day();
  const daysInMonth = dayjs()
    .year(displayYear)
    .month(displayMonth)
    .daysInMonth();

  const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
  const prevMonthYear = displayMonth === 0 ? displayYear - 1 : displayYear;
  const prevMonthDays = dayjs()
    .year(prevMonthYear)
    .month(prevMonth)
    .endOf("month")
    .date();

  const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
  const nextMonthYear = displayMonth === 11 ? displayYear + 1 : displayYear;

  const calendarDays: CalendarDay[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: dayjs()
        .year(prevMonthYear)
        .month(prevMonth)
        .date(prevMonthDays - i),
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: dayjs().year(displayYear).month(displayMonth).date(d),
      isCurrentMonth: true,
    });
  }
  while (calendarDays.length < 42) {
    const nextDay = calendarDays.length - (firstDay + daysInMonth) + 1;
    calendarDays.push({
      day: dayjs().year(nextMonthYear).month(nextMonth).date(nextDay),
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayYear((y) => y - 1);
      setDisplayMonth(11);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayYear((y) => y + 1);
      setDisplayMonth(0);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  return (
    <div>
      <div
        className={cn("flex justify-between items-center mb-1")}
      >
        <h3 className={cn("text-slate-400 ml-1.5 text-xs")}>
          {MONTH_NAMES[displayMonth]} {displayYear}
        </h3>

        <div className={cn("flex items-center gap-0.5")}>
          <Button
            onClick={handlePrevMonth}
            colour={colour}
            iconName="caretLeft"
            variant="ghost-strong"
            size="xs"
          />
          <Button
            onClick={handleNextMonth}
            colour={colour}
            iconName="caretRight"
            variant="ghost-strong"
            size="xs"
          />
        </div>
      </div>

      <div className={cn("grid grid-cols-7 gap-px")}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span
            key={d}
            className={cn("font-medium text-slate-500 text-center text-[10px] py-0")}
          >
            {d}
          </span>
        ))}

        {calendarDays.map((calendarDay, index) => {
          const isDisabled = isDateDisabled?.(calendarDay.day) ?? false;
          const isSelected =
            showSelectedDate && selectedDate?.isSame(calendarDay.day, "day");

          const isToday = calendarDay.day.isSame(today, "day");
          const dayKey = calendarDay.day.format("YYYY-MM-DD");

          const dotsForDay =
            dayDotIndicators?.[dayKey]?.flatMap((dotIndicator) =>
              Array.from(
                { length: dotIndicator.count },
                () => dotIndicator.colourClassName,
              ),
            ) ?? [];

          const dateLabel = calendarDay.day.format("MMMM D, YYYY");
          const ariaLabel =
            dotsForDay.length > 0
              ? `${dateLabel}, ${dotsForDay.length} waypoint marker${dotsForDay.length === 1 ? "" : "s"}`
              : dateLabel;
          const hasDots = dotsForDay.length > 0;

          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              aria-label={ariaLabel}
              onClick={() => onSelectDate?.(calendarDay.day)}
              className={cn(
                "w-full cursor-pointer select-none transition-colors flex flex-col items-center justify-start",
                "text-[10px] rounded-md py-0.5",
                !calendarDay.isCurrentMonth && !isDisabled && "text-slate-300",
                calendarDay.isCurrentMonth &&
                  !isSelected &&
                  !isDisabled &&
                  "text-slate-700",
                isToday && !isSelected && colour.textPill,
                isSelected && colour.background,
                isSelected && "text-white",
                isDisabled && "cursor-not-allowed text-slate-300",
                !isSelected && `hover:${colour.backgroundPill}`,
                !isSelected && `hover:${colour.textPill}`,
                isDisabled &&
                  "hover:bg-transparent hover:text-slate-300 pointer-events-none",
              )}
            >
              <span>{calendarDay.day.date()}</span>
              {hasDots && (
                <span
                  className={cn("mt-0.5 flex items-center justify-center gap-0.5")}
                >
                  {dotsForDay
                    .slice(0, MAX_VISIBLE_DOTS)
                    .map((dotClassName, dotIndex) => (
                      <span
                        key={`${dayKey}-${dotClassName}-${dotIndex}`}
                        role="presentation"
                        className={cn("w-1 h-1 rounded-full", dotClassName)}
                      />
                    ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
