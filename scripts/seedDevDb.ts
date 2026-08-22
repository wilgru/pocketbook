import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import {
  getDevDatabaseDirectory,
  getMigrationsDirectory,
} from "../src/db/paths";

const devDbDirectory = getDevDatabaseDirectory();
const devDbPath = path.join(devDbDirectory, "pocketbook.db");
const migrationsDirectory = getMigrationsDirectory();

type SeedTag = {
  name: string;
  colour: string;
  icon: string | null;
};

const tag = (
  name: string,
  colour = "grey",
  icon: string | null = null,
): SeedTag => ({
  name,
  colour,
  icon,
});

const pocketbooks = [
  {
    title: "Work",
    icon: "briefcase",
    colour: "blue",
    tagGroups: [
      {
        title: "Status",
        tags: [
          tag("To Do", "blue", "listChecks"),
          tag("In Progress", "orange", "rocketLaunch"),
          tag("Waiting", "yellow", "hourglassLow"),
          tag("Done", "green", "listChecks"),
          tag("Archived", "grey", "archive"),
        ],
      },
      {
        title: "Priority",
        tags: [
          tag("Urgent", "red", "flag"),
          tag("High", "orange", "flag"),
          tag("Normal", "blue"),
          tag("Low", "grey"),
        ],
      },
      {
        title: "Work Type",
        tags: [
          tag("Project", "purple", "blueprint"),
          tag("Meeting", "blue", "usersThree"),
          tag("Planning", "cyan", "calendarDots"),
          tag("Administration", "grey", "folder"),
          tag("Research", "green", "magnifyingGlass"),
          tag("Communication", "pink", "chatCircle"),
        ],
      },
      {
        title: "Area",
        tags: [
          tag("Product", "purple", "devices"),
          tag("Engineering", "blue", "code"),
          tag("Design", "pink", "paintBrush"),
          tag("Operations", "orange", "network"),
          tag("Finance", "green", "mathOperations"),
          tag("People", "yellow", "usersThree"),
        ],
      },
    ],
    tags: [
      tag("Deep Work", "purple", "brain"),
      tag("Quick Win", "yellow", "sparkle"),
      tag("Follow Up", "pink", "chatCircle"),
      tag("Blocked", "red", "flag"),
      tag("Remote", "blue", "houseLine"),
      tag("Recurring", "cyan", "calendarDots"),
    ],
  },
  {
    title: "Movies",
    icon: "filmSlate",
    colour: "red",
    tagGroups: [
      {
        title: "Rating",
        tags: [
          tag("⭐️", "red"),
          tag("⭐⭐️", "orange"),
          tag("⭐⭐⭐️", "yellow"),
          tag("⭐⭐⭐⭐️", "lime"),
          tag("⭐⭐⭐⭐⭐️", "green"),
        ],
      },
      {
        title: "Director",
        tags: [
          tag("Christopher Nolan", "blue", "person"),
          tag("Greta Gerwig", "orange", "person"),
          tag("Hayao Miyazaki", "green", "person"),
          tag("Martin Scorsese", "brown", "person"),
          tag("Sofia Coppola", "purple", "person"),
        ],
      },
      {
        title: "Genre",
        tags: [
          tag("Drama", "purple", "maskHappy"),
          tag("Comedy", "yellow", "maskHappy"),
          tag("Thriller", "red", "binoculars"),
          tag("Science Fiction", "blue", "planet"),
          tag("Documentary", "brown", "camera"),
          tag("Animation", "pink", "sparkle"),
        ],
      },
      {
        title: "Format",
        tags: [
          tag("Feature Film", "red", "filmSlate"),
          tag("Short Film", "orange", "filmSlate"),
          tag("Series", "blue", "devices"),
          tag("Concert Film", "purple", "musicNotesSimple"),
        ],
      },
    ],
    tags: [
      tag("Favourite", "red", "heart"),
      tag("To Watch", "blue", "bookmarkSimple"),
      tag("Rewatch", "orange"),
      tag("Comfort Movie", "yellow", "houseLine"),
      tag("Oscar Winner", "yellow", "seal"),
    ],
  },
  {
    title: "Journal",
    icon: "penNib",
    colour: "purple",
    tagGroups: [
      {
        title: "Mood",
        tags: [
          tag("Energised", "yellow", "sun"),
          tag("Calm", "green", "flowerLotus"),
          tag("Restless", "orange", "dotsNine"),
          tag("Low", "blue", "cloud"),
        ],
      },
      {
        title: "Entry Type",
        tags: [
          tag("Reflection", "purple", "notebook"),
          tag("Gratitude", "pink", "heart"),
          tag("Idea", "yellow", "lightbulbFilament"),
          tag("Memory", "blue", "camera"),
        ],
      },
    ],
    tags: [
      tag("Personal", "purple", "person"),
      tag("Weekend", "cyan", "calendarDots"),
      tag("Important", "red", "flag"),
      tag("Work Life", "blue", "briefcase"),
    ],
  },
];

async function confirmWipe(): Promise<boolean> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await readline.question(
    `This will permanently wipe ${devDbPath}. Continue? (y/n): `,
  );
  readline.close();

  return answer.trim().toLowerCase() === "y";
}

function seedDatabase(): void {
  mkdirSync(devDbDirectory, { recursive: true });

  const sqlite = new Database(devDbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = OFF");

  try {
    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder: migrationsDirectory });
    sqlite.pragma("foreign_keys = ON");

    const wipeAndSeed = sqlite.transaction(() => {
      for (const tableName of [
        "comment_notes",
        "note_tags",
        "tasks",
        "tags",
        "comments",
        "notes",
        "tag_groups",
        "pocketbooks",
      ]) {
        sqlite.prepare(`DELETE FROM ${tableName}`).run();
      }

      const created = new Date().toISOString();
      const insertPocketbook = sqlite.prepare(
        `INSERT INTO pocketbooks (id, title, icon, colour, created, updated)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      const insertTagGroup = sqlite.prepare(
        `INSERT INTO tag_groups (id, title, pocketbook, created, updated)
         VALUES (?, ?, ?, ?, ?)`,
      );
      const insertTag = sqlite.prepare(
        `INSERT INTO tags (id, name, colour, icon, tag_group, pocketbook, created, updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      );

      for (const pocketbook of pocketbooks) {
        const pocketbookId = randomUUID();
        insertPocketbook.run(
          pocketbookId,
          pocketbook.title,
          pocketbook.icon,
          pocketbook.colour,
          created,
          created,
        );

        for (const tagGroup of pocketbook.tagGroups) {
          const tagGroupId = randomUUID();
          insertTagGroup.run(
            tagGroupId,
            tagGroup.title,
            pocketbookId,
            created,
            created,
          );

          for (const seededTag of tagGroup.tags) {
            insertTag.run(
              randomUUID(),
              seededTag.name,
              seededTag.colour,
              seededTag.icon,
              tagGroupId,
              pocketbookId,
              created,
              created,
            );
          }
        }

        for (const seededTag of pocketbook.tags) {
          insertTag.run(
            randomUUID(),
            seededTag.name,
            seededTag.colour,
            seededTag.icon,
            null,
            pocketbookId,
            created,
            created,
          );
        }
      }
    });

    wipeAndSeed();
  } finally {
    sqlite.close();
  }
}

if (await confirmWipe()) {
  seedDatabase();
  console.log(`Seeded ${pocketbooks.length} pocketbooks in ${devDbPath}.`);
} else {
  console.log("Seed cancelled. The dev database was not changed.");
  process.exitCode = 1;
}
