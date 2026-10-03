import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { Colour } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

export type CreatePocketbookInput = {
  title: string;
  icon: CustomisationIconName | null;
  colour: Colour;
};

export const createPocketbookServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: CreatePocketbookInput) => input)
  .handler<Promise<Pocketbook>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(pocketbooks)
      .values({
        id,
        title: data.title,
        icon: data.icon,
        colour: data.colour,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return { ...inserted, noteCount: 0, taskCount: 0 };
  });
