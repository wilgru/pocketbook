import type { Prettify } from "./Prettify.type";
import type { InferSelectModel } from "drizzle-orm/table";

export type InferFromModelAndExtend<T, E> = Prettify<InferSelectModel<T> & E>;
