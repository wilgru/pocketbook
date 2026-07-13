import { useNavigate } from "@tanstack/react-router";
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
import type { Update, UpdateGroup } from "src/updates/Update.type";

type UpdatesLayoutProps = {
  updates: Update[];
  notes: Note[];
  tasks: Task[];
  colour?: Colour;
  pendingNew?: boolean;
  onCancelNew?: () => void;
  onCreateNew?: () => void;
};

const getGroupDate = (updateGroup: UpdateGroup): Dayjs | null => {
  const firstUpdate = updateGroup.updates[0];
  return firstUpdate ? firstUpdate.date.startOf("day") : null;
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
  const updateGroups = useMemo(
    () => groupUpdates(updates, tasks, notes),
    [updates, tasks, notes],
  );

  const tableOfContentsGroups: {
    title: string;
    items: {
      title: string;
      navigationId: string;
      icons: { iconName: string; colour: Colour }[];
    }[];
  }[] = useMemo(() => {
    return updateGroups.reduce<
      {
        title: string;
        items: {
          title: string;
          navigationId: string;
          icons: { iconName: string; colour: Colour }[];
        }[];
      }[]
    >((acc, updateGroup) => {
      const formattedDate = updateGroup.date.format("MMMM, YYYY");
      const item = {
        title: updateGroup.date.format("D dddd"),
        navigationId: updateGroup.date.format("YYYY-MM-DD"),
        icons: updateGroup.updates.reduce<
          { iconName: string; colour: Colour }[]
        >((icons, update) => {
          if (update.type !== "comment" || !update.data?.isWaypoint) {
            return icons;
          }

          icons.push({
            iconName: "flagBannerFold",
            colour: getTintClasses(update.data.tint).colour,
          });
          return icons;
        }, []),
      };

      const existingGroup = acc.find((group) => group.title === formattedDate);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        acc.push({
          title: formattedDate,
          items: [item],
        });
      }

      return acc;
    }, []);
  }, [updateGroups]);

  const navigationIdByDate = useMemo(() => {
    return new Map(
      updateGroups
        .map((updateGroup) => [
          getGroupDate(updateGroup)?.format("YYYY-MM-DD"),
          updateGroup.date.format("YYYY-MM-DD"),
        ])
        .filter((entry): entry is [string, string] => Boolean(entry[0])),
    );
  }, [updateGroups]);

  const availableDateKeys = useMemo(() => {
    return new Set(
      updateGroups
        .map((updateGroup) => getGroupDate(updateGroup)?.format("YYYY-MM-DD"))
        .filter(Boolean),
    );
  }, [updateGroups]);

  const dayDotIndicators = useMemo(() => {
    return updateGroups.reduce<
      Record<string, Array<{ colourClassName: string; count: number }>>
    >((acc, updateGroup) => {
      const dateKey = getGroupDate(updateGroup)?.format("YYYY-MM-DD");
      if (!dateKey) return acc;

      const dotCountByColour = updateGroup.updates.reduce<
        Record<string, number>
      >((waypointAcc, update) => {
        if (update.type === "comment" && update.data.isWaypoint) {
          const colourClassName = getTintClasses(update.data.tint).colour
            .background;
          waypointAcc[colourClassName] =
            (waypointAcc[colourClassName] ?? 0) + 1;
        }
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
  }, [updateGroups]);

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
      sidebar={tableOfContentsGroups.map((tableOfContentsGroup) => (
        <ListSection
          title={tableOfContentsGroup.title}
          key={tableOfContentsGroup.title}
        >
          {tableOfContentsGroup.items.map((tableOfContentsItem) => (
            <TableOfContentsListItem
              key={tableOfContentsItem.navigationId}
              title={tableOfContentsItem.title}
              navigationId={tableOfContentsItem.navigationId}
              onJumpTo={(id) => navigate({ to: `#${id}` })}
              colour={colour}
              icons={tableOfContentsItem.icons}
            />
          ))}
        </ListSection>
      ))}
      content={
        <div className="h-full w-full max-w-[800px] flex flex-col pb-6">
          {pendingNew && (
            <UpdateEditor
              update={{ notes: [], tint: null }}
              colour={colour}
              onCancel={onCancelNew}
              onCreated={onCancelNew}
            />
          )}

          {updateGroups.map((updateGroup) => (
            <UpdatesSection
              key={updateGroup.date.valueOf()}
              colour={colour}
              title={updateGroup.date.format("MMMM D, YYYY")}
              updateGroup={updateGroup}
            />
          ))}

          {updateGroups.length === 0 && !pendingNew && (
            <EmptyState text="No updates yet" onAdd={onCreateNew} />
          )}

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
