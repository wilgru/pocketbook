import dayjs from "dayjs";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { getTintClasses } from "src/updates/utils/getTintClasses";
import { groupUpdates } from "src/updates/utils/groupUpdates";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { Update, UpdatesGroup } from "src/updates/Update.type";

export type UpdatesPageSection = {
  date: Dayjs;
  dateKey: string;
  navigationId: string;
  group: UpdatesGroup;
  notes: Note[];
  tasks: Task[];
};

export type UpdatesPageSidebarMonthGroup = {
  monthYear: string;
  items: Array<{
    title: string;
    navigationId: string;
    icons: Array<{ iconName: string; colour: Colour }>;
  }>;
};

export type UpdatesPageData = {
  sections: UpdatesPageSection[];
  sidebarMonthGroups: UpdatesPageSidebarMonthGroup[];
  navigationIdByDate: Map<string, string>;
  availableDateKeys: Set<string>;
  dayDotIndicators: Record<
    string,
    Array<{ colourClassName: string; count: number }>
  >;
};

const getGroupDate = (group: UpdatesGroup): Dayjs | null => {
  const firstUpdate = group.updates[0];
  return firstUpdate ? firstUpdate.created.startOf("day") : null;
};

const getTaskGroupingDate = (task: Task): Dayjs | null => {
  return task.dueDate ?? task.completedDate ?? task.cancelledDate ?? null;
};

const getSectionTitle = (date: Dayjs): string => {
  const diffDays = dayjs().startOf("day").diff(date, "day");
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.format("D MMM, dddd");
};

export const buildUpdatesPageData = ({
  updates,
  notes,
  tasks,
}: {
  updates: Update[];
  notes: Note[];
  tasks: Task[];
}): UpdatesPageData => {
  const groupedUpdates = groupUpdates(updates);

  const notesByDate = new Map<string, Note[]>();
  notes.forEach((note) => {
    const dateKey = note.created.startOf("day").format("YYYY-MM-DD");
    if (!notesByDate.has(dateKey)) {
      notesByDate.set(dateKey, []);
    }

    notesByDate.get(dateKey)!.push(note);
  });

  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const taskDate = getTaskGroupingDate(task);
    if (!taskDate) {
      return;
    }

    const dateKey = taskDate.startOf("day").format("YYYY-MM-DD");
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, []);
    }

    tasksByDate.get(dateKey)!.push(task);
  });

  const updatesByDate = new Map<string, UpdatesGroup>();
  groupedUpdates.forEach((group) => {
    const dateKey = getGroupDate(group)?.format("YYYY-MM-DD");
    if (dateKey) {
      updatesByDate.set(dateKey, group);
    }
  });

  const allDateKeys = Array.from(
    new Set([
      ...updatesByDate.keys(),
      ...notesByDate.keys(),
      ...tasksByDate.keys(),
    ]),
  ).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());

  const sections: UpdatesPageSection[] = allDateKeys.map((dateKey) => {
    const date = dayjs(dateKey).startOf("day");
    const updateGroup = updatesByDate.get(dateKey);
    const group =
      updateGroup ??
      ({
        title: getRelativeDateTitle(date, true, false),
        updates: [],
      } satisfies UpdatesGroup);

    return {
      date,
      dateKey,
      group,
      navigationId: group.title,
      notes: notesByDate.get(dateKey) ?? [],
      tasks: tasksByDate.get(dateKey) ?? [],
    };
  });

  const sidebarMonthMap = new Map<
    string,
    UpdatesPageSidebarMonthGroup["items"]
  >();
  sections.forEach((section) => {
    const monthKey = `${section.date.format("MMMM")} ${section.date.format("YYYY")}`;
    if (!sidebarMonthMap.has(monthKey)) {
      sidebarMonthMap.set(monthKey, []);
    }

    sidebarMonthMap.get(monthKey)!.push({
      title: getSectionTitle(section.date),
      navigationId: section.navigationId,
      icons: section.group.updates
        .filter((update) => update.isWaypoint)
        .map((update) => ({
          iconName: "flagBannerFold",
          colour: getTintClasses(update.tint).colour,
        })),
    });
  });

  const sidebarMonthGroups = Array.from(
    sidebarMonthMap,
    ([monthYear, items]) => ({
      monthYear,
      items,
    }),
  );

  const navigationIdByDate = new Map(
    sections.map((section) => [section.dateKey, section.navigationId]),
  );

  const availableDateKeys = new Set(sections.map((section) => section.dateKey));

  const dayDotIndicators = groupedUpdates.reduce<
    Record<string, Array<{ colourClassName: string; count: number }>>
  >((acc, group) => {
    const dateKey = getGroupDate(group)?.format("YYYY-MM-DD");
    if (!dateKey) return acc;

    const dotCountByColour = group.updates
      .filter((update) => update.isWaypoint)
      .reduce<Record<string, number>>((waypointAcc, update) => {
        const colourClassName = getTintClasses(update.tint).colour.background;
        waypointAcc[colourClassName] = (waypointAcc[colourClassName] ?? 0) + 1;
        return waypointAcc;
      }, {});

    acc[dateKey] = Object.entries(dotCountByColour).map(
      ([colourClassName, count]) => ({
        colourClassName,
        count,
      }),
    );

    return acc;
  }, {});

  return {
    sections,
    sidebarMonthGroups,
    navigationIdByDate,
    availableDateKeys,
    dayDotIndicators,
  };
};
