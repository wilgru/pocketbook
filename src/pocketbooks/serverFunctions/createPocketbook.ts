import { createServerFn } from "@tanstack/react-start";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { ColourName } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

export type CreatePocketbookInput = {
  title: string;
  icon: CustomisationIconName | null;
  colour: ColourName;
  userId: string | null;
};

export const createPocketbookServerFn = createServerFn({ method: "POST" })
  .validator((input: CreatePocketbookInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(pocketbooks)
      .values({
        id,
        title: data.title,
        icon: data.icon,
        colour: data.colour,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  });
