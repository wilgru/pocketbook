import { customType } from "drizzle-orm/sqlite-core";
import { getColour } from "src/colours/utils/getColour";
import type { Colour, ColourName } from "src/colours/Colour.type";

export const colourColumn = customType<{ data: Colour; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value: Colour): string {
    return value.name;
  },
  fromDriver(value: string): Colour {
    return getColour(value as ColourName);
  },
});
