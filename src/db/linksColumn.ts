import { customType } from "drizzle-orm/sqlite-core";
import type { Link } from "src/common/types/Link.type";

export const linksColumn = customType<{ data: Link[]; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: Link[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): Link[] {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
});
