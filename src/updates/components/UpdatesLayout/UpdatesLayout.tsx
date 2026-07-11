import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { ListSection } from "src/common/components/ListSection/ListSection";
import { TableOfContentsListItem } from "src/common/components/TableOfContentsListItem/TableOfContentsListItem";
import { TwoPaneLayout } from "src/common/components/TwoPaneLayout/TwoPaneLayout";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { UpdatesSection } from "src/updates/components/UpdatesSection/UpdatesSection";
import { getTintClasses } from "src/updates/utils/getTintClasses";
import { groupUpdates } from "src/updates/utils/groupUpdates";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { NormalisedGroupItem, Update } from "src/updates/Update.type";

type UpdatesLayoutProps = {
  updates: Update[];
  notes: Note[];
  tasks: Task[];
  colour?: Colour;
  pendingNew?: boolean;
  onCancelNew?: () => void;
  onCreateNew?: () => void;
};

const getGroupDate = (group: { updates: Update[] }): Dayjs | null => {
  const firstUpdate = group.updates[0];
  return firstUpdate ? firstUpdate.created.startOf("day") : null;
};

export const UpdatesLayout = ({
  updates,
  notes,
  tasks,
  colour = colours.orange,
  pendingNew = false,
  onCancelNew,
  onCreateNew,
}: UpdatesLayoutProps) => {
  const navigate = useNavigate();
  const groupedUpdates = useMemo(() => groupUpdates(updates), [updates]);

  const groupedContent = useMemo(() => {
    const noteItemsByDate = notes.reduce((acc, note) => {
      const createdKey = note.created.startOf("day").format("YYYY-MM-DD");
      const updatedKey = note.updated.startOf("day").format("YYYY-MM-DD");

      if (!acc.has(createdKey)) acc.set(createdKey, []);
      acc.get(createdKey)!.push({
        id: note.id,
        type: "note" as const,
        action: "created" as const,
        date: note.created,
        title: note.title ?? "",
      });

      if (updatedKey !== createdKey) {
        if (!acc.has(updatedKey)) acc.set(updatedKey, []);
        acc.get(updatedKey)!.push({
          id: note.id,
          type: "note" as const,
          action: "updated" as const,
          date: note.updated,
          title: note.title ?? "",
        });
      }

      return acc;
    }, new Map<string, NormalisedGroupItem[]>());

    const taskItemsByDate = tasks.reduce((acc, task) => {
      if (task.completedDate) {
        const key = task.completedDate.startOf("day").format("YYYY-MM-DD");
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key)!.push({
          id: task.id,
          type: "task" as const,
          action: "completed" as const,
          date: task.completedDate,
          title: task.title,
        });
      }

      if (task.cancelledDate) {
        const key = task.cancelledDate.startOf("day").format("YYYY-MM-DD");
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key)!.push({
          id: task.id,
          type: "task" as const,
          action: "cancelled" as const,
          date: task.cancelledDate,
          title: task.title,
        });
      }

      return acc;
    }, new Map<string, NormalisedGroupItem[]>());

    return groupedUpdates.map((group) => {
      const groupDateKey = getGroupDate(group)?.format("YYYY-MM-DD");

      const normalisedItems: NormalisedGroupItem[] = [
        ...(groupDateKey ? (noteItemsByDate.get(groupDateKey) ?? []) : []),
        ...(groupDateKey ? (taskItemsByDate.get(groupDateKey) ?? []) : []),
      ].sort((a, b) => b.date.valueOf() - a.date.valueOf());

      return {
        ...group,
        normalisedItems,
      };
    });
  }, [groupedUpdates, notes, tasks]);

  const effectiveUpdateGroups = useMemo(() => {
    const monthGroups = new Map<string, typeof groupedContent>();

    groupedContent.forEach((group) => {
      const groupDate = getGroupDate(group);
      const monthKey = groupDate
        ? `${groupDate.format("MMMM")} ${groupDate.format("YYYY")}`
        : "Other";

      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push(group);
    });

    return Array.from(monthGroups, ([monthYear, groups]) => ({
      monthYear,
      items: groups.map((group) => {
        const groupDate = getGroupDate(group);
        const diffDays = groupDate
          ? dayjs().startOf("day").diff(groupDate, "day")
          : null;

        let sectionTitle = group.title;
        if (groupDate) {
          if (diffDays === 0) {
            sectionTitle = "Today";
          } else if (diffDays === 1) {
            sectionTitle = "Yesterday";
          } else {
            sectionTitle = groupDate.format("D MMM, dddd");
          }
        }

        return {
          title: sectionTitle,
          navigationId: group.title,
          icons: group.updates
            .filter((update) => update.isWaypoint)
            .map((update) => ({
              iconName: "flagBannerFold",
              colour: getTintClasses(update.tint).colour,
            })),
        };
      }),
    }));
  }, [groupedContent]);

  const navigationIdByDate = useMemo(() => {
    return new Map(
      groupedContent
        .map((group) => [
          getGroupDate(group)?.format("YYYY-MM-DD"),
          group.title,
        ])
        .filter((entry): entry is [string, string] => Boolean(entry[0])),
    );
  }, [groupedContent]);

  const availableDateKeys = useMemo(() => {
    return new Set(
      groupedContent
        .map((group) => getGroupDate(group)?.format("YYYY-MM-DD"))
        .filter(Boolean),
    );
  }, [groupedContent]);

  const dayDotIndicators = useMemo(() => {
    return groupedContent.reduce<
      Record<string, Array<{ colourClassName: string; count: number }>>
    >((acc, group) => {
      const dateKey = getGroupDate(group)?.format("YYYY-MM-DD");
      if (!dateKey) return acc;

      const dotCountByColour = group.updates
        .filter((update) => update.isWaypoint)
        .reduce<Record<string, number>>((waypointAcc, update) => {
          const colourClassName = getTintClasses(update.tint).colour.background;
          waypointAcc[colourClassName] =
            (waypointAcc[colourClassName] ?? 0) + 1;
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
  }, [groupedContent]);

  return (
    <TwoPaneLayout
      sidebarTopContent={
        <Calendar
          colour={colour}
          size="sm"
          showSelectedDate={false}
          dayDotIndicators={dayDotIndicators}
          isDateDisabled={(date) =>
            !availableDateKeys.has(date.startOf("day").format("YYYY-MM-DD"))
          }
          onSelectDate={(date) => {
            const dateKey = date.startOf("day").format("YYYY-MM-DD");
            const targetNavigationId = navigationIdByDate.get(dateKey);
            if (!targetNavigationId) return;
            navigate({ to: `#${targetNavigationId}` });
          }}
        />
      }
      showSidebarTopContentDivider
      sidebar={effectiveUpdateGroups.map((monthGroup) => (
        <ListSection title={monthGroup.monthYear}>
          {monthGroup.items.map((item) => (
            <TableOfContentsListItem
              key={item.navigationId}
              title={item.title}
              navigationId={item.navigationId}
              onJumpTo={(id) => navigate({ to: `#${id}` })}
              colour={colour}
              icons={item.icons}
            />
          ))}
        </ListSection>
      ))}
      content={
        <div className="h-full w-full max-w-[800px] flex flex-col gap-14 pb-6">
          {pendingNew && (
            <UpdateEditor
              update={{ notes: [], tint: null }}
              colour={colour}
              onCancel={onCancelNew}
              onCreated={onCancelNew}
            />
          )}

          {groupedContent.map((updatesGroup) => (
            <UpdatesSection
              key={updatesGroup.title}
              colour={colour}
              title={updatesGroup.title}
              updateGroup={updatesGroup}
            />
          ))}

          {groupedUpdates.length === 0 && !pendingNew && (
            <EmptyState text="No updates yet" onAdd={onCreateNew} />
          )}

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
