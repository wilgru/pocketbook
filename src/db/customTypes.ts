import dayjs, { type Dayjs } from "dayjs";
import { customType } from "drizzle-orm/sqlite-core";
import { normalizeLexicalContent } from "src/common/utils/lexicalContent";
import type { Link } from "src/common/types/Link.type";

export const dayjsTimestamp = customType<{
  data: Dayjs;
  driverData: string;
}>({
  dataType: () => "text",

  toDriver(value) {
    return value.toISOString();
  },

  fromDriver(value) {
    return dayjs(value);
  },
});

export const linksJson = customType<{
  data: Link[];
  driverData: string;
}>({
  dataType: () => "text",

  toDriver(value) {
    return JSON.stringify(value);
  },

  fromDriver(value) {
    return JSON.parse(value);
  },
});

export const lexicalText = customType<{
  data: string;
  driverData: string;
}>({
  dataType: () => "text",

  toDriver(value) {
    return value;
  },

  fromDriver(value) {
    return normalizeLexicalContent(value);
  },
});
