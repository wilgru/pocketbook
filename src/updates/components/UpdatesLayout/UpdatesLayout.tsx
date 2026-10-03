import { useEffect, useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { CommentEditor } from "src/comments/components/CommentEditor/CommentEditor";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { ListSection } from "src/common/components/ListSection/ListSection";
import { PaneWithInspectorLayout } from "src/common/components/PaneWithInspectorLayout/PaneWithInspectorLayout";
import { TableOfContentsListItem } from "src/common/components/TableOfContentsListItem/TableOfContentsListItem";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { getPlainTextFromLexicalContent } from "src/common/utils/lexicalContent";
import { Icon } from "src/icons/components/Icon/Icon";
import { UpdatesSection } from "src/updates/components/UpdatesSection/UpdatesSection";
import { groupUpdates } from "src/updates/utils/groupUpdates";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { IconName } from "src/icons/Icon.type";
import type { Note } from "src/notes/notes.schema";
import type { Task } from "src/tasks/tasks.schema";
import type { UpdateGroup } from "src/updates/Update.type";

type UpdatesLayoutProps = {
  notes: Note[];
  tasks: Task[];
  comments: Comment[];
  colour?: Colour;
  view?: "daily" | "history";
  selectedDate: Dayjs;
  onSelectDate: (date: Dayjs) => void;
  pendingNew?: boolean;
  onCancelNew?: () => void;
  onCreateNew?: () => void;
};

const getGroupDate = (updateGroup: UpdateGroup): Dayjs | null => {
  const firstUpdate = updateGroup.updates[0];
  return firstUpdate ? firstUpdate.date.startOf("day") : null;
};

export const UpdatesLayout = ({
  notes,
  tasks,
  comments,
  colour = colours.orange,
  view = "daily",
  selectedDate,
  onSelectDate,
  pendingNew = false,
  onCancelNew,
  onCreateNew,
}: UpdatesLayoutProps) => {
  const updateGroups = useMemo(
    () => groupUpdates(comments, tasks, notes),
    [comments, tasks, notes],
  );

  const visibleUpdateGroups = useMemo(
    () =>
      view === "daily"
        ? updateGroups.filter((updateGroup) =>
            updateGroup.date.isSame(selectedDate, "day"),
          )
        : updateGroups,
    [view, updateGroups, selectedDate],
  );

  const selectedDateKey = selectedDate.format("YYYY-MM-DD");
  const hasSelectedDateGroup = updateGroups.length > 0;

  const scrollToDate = (date: Dayjs) => {
    const targetGroup = updateGroups.find((updateGroup) =>
      updateGroup.date.isSame(date, "day"),
    );
    if (!targetGroup) return;

    document
      .getElementById(getRelativeDateTitle(targetGroup.date, false, false))
      ?.scrollIntoView();
  };

  // Handles URL-driven date changes (and initial load) in history view.
  useEffect(() => {
    if (view !== "history") return;
    scrollToDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedDateKey, hasSelectedDateGroup]);

  // Also scroll directly so re-selecting the already-selected date still jumps.
  const handleSelectDate = (date: Dayjs) => {
    onSelectDate(date);
    if (view === "history") scrollToDate(date);
  };

  const tableOfContentsGroups: {
    title: string;
    items: {
      title: string;
      date: Dayjs;
      icons: { iconName: IconName; colour: Colour }[];
      waypointContents: string[];
    }[];
  }[] = useMemo(() => {
    return updateGroups.reduce<
      {
        title: string;
        items: {
          title: string;
          date: Dayjs;
          icons: { iconName: IconName; colour: Colour }[];
          waypointContents: string[];
        }[];
      }[]
    >((acc, updateGroup) => {
      const formattedDate = updateGroup.date.format("MMMM, YYYY");

      const item = {
        title: updateGroup.date.format("D dddd"),
        date: updateGroup.date,
        icons: updateGroup.updates.reduce<
          { iconName: IconName; colour: Colour }[]
        >((icons, update) => {
          if (update.type !== "comment" || !update.data?.isWaypoint) {
            return icons;
          }

          icons.push({
            iconName: "flagBannerFold",
            colour: update.data.colour ?? colours.grey,
          });

          return icons;
        }, []),
        waypointContents: updateGroup.updates.flatMap((update) =>
          update.type === "comment" && update.data?.isWaypoint
            ? [getPlainTextFromLexicalContent(update.data.content)]
            : [],
        ),
      };

      if (item.icons.length === 0) {
        return acc;
      }

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
          const colourClassName =
            update.data.colour?.background ?? colours.grey.background;

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
    <PaneWithInspectorLayout
      sidebarTopContent={
        <Calendar
          colour={colour}
          selectedDate={selectedDate}
          dayDotIndicators={dayDotIndicators}
          isDateDisabled={
            view === "history"
              ? (date) =>
                  !availableDateKeys.has(
                    date.startOf("day").format("YYYY-MM-DD"),
                  )
              : undefined
          }
          onSelectDate={handleSelectDate}
        />
      }
      sidebar={tableOfContentsGroups.map((tableOfContentsGroup) => (
        <ListSection
          title={tableOfContentsGroup.title}
          key={tableOfContentsGroup.title}
        >
          {tableOfContentsGroup.items.map((tableOfContentsItem) => (
            <TableOfContentsListItem
              key={tableOfContentsItem.date.format("YYYY-MM-DD")}
              tooltipSide="left"
              tooltipContent={
                <div className="flex flex-col divide-y divide-slate-600">
                  {tableOfContentsItem.waypointContents.map(
                    (content, index) => (
                      <p
                        key={index}
                        className="py-1 wrap-break-word whitespace-pre-wrap text-white first:pt-0 last:pb-0"
                      >
                        {content || "(empty comment)"}
                      </p>
                    ),
                  )}
                </div>
              }
              title={tableOfContentsItem.title}
              onClick={() => handleSelectDate(tableOfContentsItem.date)}
              colour={colour}
            >
              {tableOfContentsItem.icons.length > 0 && (
                <span
                  className="flex shrink-0 items-center gap-1"
                  aria-hidden="true"
                >
                  {tableOfContentsItem.icons.map((icon, index) => (
                    <Icon
                      key={`${tableOfContentsItem.title}-${icon.iconName}-${index}`}
                      iconName={icon.iconName}
                      size="sm"
                      className={icon.colour.text}
                    />
                  ))}
                </span>
              )}
            </TableOfContentsListItem>
          ))}
        </ListSection>
      ))}
      content={
        <div className="flex h-full w-full max-w-200 flex-col gap-6">
          {pendingNew && (
            <CommentEditor
              comment={{ notes: [], colour: null }}
              colour={colour}
              onCancel={onCancelNew}
              onCreated={onCancelNew}
            />
          )}

          {visibleUpdateGroups.map((updateGroup) => (
            <UpdatesSection
              key={updateGroup.date.valueOf()}
              colour={colour}
              title={getRelativeDateTitle(updateGroup.date, false, false)}
              updateGroup={updateGroup}
            />
          ))}

          {visibleUpdateGroups.length === 0 && !pendingNew && (
            <EmptyState text="No updates yet" onAdd={onCreateNew} />
          )}

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
