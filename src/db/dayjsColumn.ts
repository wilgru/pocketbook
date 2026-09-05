import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { customType } from "drizzle-orm/sqlite-core";

dayjs.extend(utc);

export const dayjsColumn = customType<{ data: Dayjs; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: Dayjs): string {
    return value.utc().toISOString();
  },
  fromDriver(value: string): Dayjs {
    return dayjs.utc(value).local();
  },
});
