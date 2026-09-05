import { createSerializationAdapter } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export const dayjsSerializer = createSerializationAdapter({
  key: "Dayjs",
  test: (value: unknown): value is Dayjs => dayjs.isDayjs(value),
  toSerializable: (value: Dayjs): string => value.toISOString(),
  fromSerializable: (value: string): Dayjs => dayjs(value),
});
