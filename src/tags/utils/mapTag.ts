import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { getColour } from "src/colours/utils/getColour";
import type { Tag } from "src/tags/Tag.type";
import type { TagSchema } from "src/tags/tags.schema";

dayjs.extend(utc);

type MapTagOptions = {
  noteCount?: number;
};

export const mapTag = (tag: TagSchema, options: MapTagOptions = {}): Tag => {
  return {
    id: tag.id,
    name: tag.name,
    colour: getColour(tag.colour),
    icon: tag.icon,
    layout: tag.layout ?? "list",
    description: tag.description ?? null,
    noteCount: options.noteCount ?? 0,
    links: tag.links ? JSON.parse(tag.links) : [],
    groupBy: (tag.groupBy as "created" | "tag" | null) ?? null,
    sortBy: (tag.sortBy ?? "created") as "alphabetical" | "created",
    sortDirection: (tag.sortDirection ?? "desc") as "asc" | "desc",
    tagGroupId: tag.tagGroup || null,
    created: dayjs.utc(tag.created).local(),
    updated: dayjs.utc(tag.updated).local(),
  };
};
