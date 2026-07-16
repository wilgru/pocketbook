import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export const getRelativeDateTitle = (
  date: Dayjs,
  showDay: boolean = false,
  showTime: boolean = true,
): string => {
  const today = dayjs();
  const diffDays = today.diff(date, "day");

  const dayLabel =
    diffDays === 0
      ? "Today"
      : diffDays === 1
        ? "Yesterday"
        : date.format("dddd");

  const dateLabel =
    date.year() !== today.year()
      ? date.format("D MMMM, YYYY")
      : date.format("D MMMM");

  const title = showDay ? `${dayLabel}, ${dateLabel}` : dateLabel;

  return showTime ? `${title}, ${date.format("hh:mm a")}` : title;
};
