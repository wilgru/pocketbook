import { useMemo, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { PageHeader } from "src/common/components/PageHeader/PageHeader";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import TableOfContents from "src/tableOfContents/TableOfContents/TableOfContents";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { UpdatesSection } from "src/updates/components/UpdatesSection/UpdatesSection";
import { getTintClasses } from "src/updates/utils/getTintClasses";
import { groupUpdates } from "src/updates/utils/groupUpdates";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Update } from "src/updates/Update.type";

type UpdatesLayoutProps = {
  updates: Update[];
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
  colour = colours.orange,
  pendingNew = false,
  onCancelNew,
  onCreateNew,
}: UpdatesLayoutProps) => {
  const [navigationId, setNavigationId] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Dayjs | null>(
    null,
  );

  const groupedUpdates = groupUpdates(updates);

  const badges = useMemo(() => [`${updates.length} updates`], [updates.length]);

  const tableOfContentItems = useMemo(() => {
    return groupedUpdates.map((group) => {
      const groupDate = getGroupDate(group);
      const sectionTitle = groupDate
        ? `${groupDate.format("D")} ${groupDate.format("MMMM")}`
        : group.title;
      const sectionGroup = groupDate
        ? `${groupDate.format("MMMM")} ${groupDate.format("YYYY")}`
        : undefined;

      return {
        title: sectionTitle,
        navigationId: group.title,
        group: sectionGroup,
        icons: group.updates
          .filter((update) => update.isWaypoint)
          .map((update) => ({
            iconName: "flagBannerFold",
            colour: getTintClasses(update.tint).colour,
          })),
      };
    });
  }, [groupedUpdates]);

  const dateByNavigationId = useMemo(() => {
    return new Map(
      groupedUpdates
        .map((group) => [group.title, getGroupDate(group)])
        .filter((entry): entry is [string, Dayjs] => Boolean(entry[1])),
    );
  }, [groupedUpdates]);

  const navigationIdByDate = useMemo(() => {
    return new Map(
      groupedUpdates
        .map((group) => [getGroupDate(group)?.format("YYYY-MM-DD"), group.title])
        .filter((entry): entry is [string, string] => Boolean(entry[0])),
    );
  }, [groupedUpdates]);

  const availableDateKeys = useMemo(() => {
    return new Set(
      groupedUpdates
        .map((group) => getGroupDate(group)?.format("YYYY-MM-DD"))
        .filter(Boolean),
    );
  }, [groupedUpdates]);

  const dayDotIndicators = useMemo(() => {
    return groupedUpdates.reduce<
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
  }, [groupedUpdates]);

  return (
    <div className="h-full max-w-[1000px] w-full min-w-0 pb-16 flex items-center">
      <div className="h-full w-full p-12 flex flex-col gap-14 overflow-y-scroll">
        <PageHeader colour={colour} badges={badges}>
          <div className="flex gap-3 items-end">
            <Icon
              className={cn("pb-1", colour.text)}
              iconName="chatCenteredText"
              size="xl"
            />
            <h1 className="font-title text-5xl">Updates</h1>
          </div>
        </PageHeader>

        {pendingNew && (
          <div className="flex flex-col">
            <UpdateEditor
              update={{ notes: [], tint: null }}
              colour={colour}
              onCancel={onCancelNew}
              onCreated={onCancelNew}
            />
          </div>
        )}

        {groupedUpdates.length === 0 && !pendingNew && (
          <EmptyState text="No updates yet" onAdd={onCreateNew} />
        )}

        {groupedUpdates.map((group) => (
          <UpdatesSection key={group.title} group={group} colour={colour} />
        ))}
      </div>

      {tableOfContentItems.length > 0 && (
        <div className="flex flex-col justify-center">
          <TableOfContents
            title="Updates"
            items={tableOfContentItems}
            colour={colour}
            activeItemNavigationId={navigationId}
            onJumpTo={(id) => {
              setNavigationId(id);
              const date = dateByNavigationId.get(id);
              if (date) setSelectedCalendarDate(date);
            }}
          >
            <Calendar
              colour={colour}
              selectedDate={selectedCalendarDate}
              dayDotIndicators={dayDotIndicators}
              isDateDisabled={(date) =>
                !availableDateKeys.has(date.startOf("day").format("YYYY-MM-DD"))
              }
              onSelectDate={(date) => {
                const dateKey = date.startOf("day").format("YYYY-MM-DD");
                const targetNavigationId = navigationIdByDate.get(dateKey);
                if (!targetNavigationId) return;
                setSelectedCalendarDate(date.startOf("day"));
                setNavigationId(targetNavigationId);
              }}
            />
          </TableOfContents>
        </div>
      )}
    </div>
  );
};
