import type { TagGroupSchema, TagSchema } from "./tags.schema";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Prettify } from "src/common/types/Prettify.type";

export type TagLink = Link;

export type Tag = Prettify<
  Omit<
    TagSchema,
    | "colour"
    | "links"
    | "groupBy"
    | "sortBy"
    | "sortDirection"
    | "layout"
    | "tagGroup"
    | "pocketbook"
    | "user"
    | "created"
    | "updated"
  > & {
    colour: Colour;
    links: TagLink[];
    groupBy: "created" | "tag" | null;
    sortBy: "alphabetical" | "created";
    sortDirection: "asc" | "desc";
    layout: "list" | "table";
    tagGroupId: string | null;
    noteCount: number;
    created: Dayjs;
    updated: Dayjs;
  }
>;

export type TagGroup = Prettify<
  Omit<TagGroupSchema, "pocketbook" | "user" | "created" | "updated"> & {
    tags: Tag[];
    created: Dayjs;
    updated: Dayjs;
  }
>;
