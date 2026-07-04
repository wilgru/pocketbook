import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { Calendar } from "src/common/components/Calendar/Calendar";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { TwoPaneLayout } from "src/common/components/TwoPaneLayout/TwoPaneLayout";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
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
  const navigate = useNavigate();
  const groupedUpdates = groupUpdates(updates);

  const updatesGroupedByMonth = useMemo(() => {
    const monthGroups = new Map<string, typeof groupedUpdates>();

    groupedUpdates.forEach((group) => {
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
  }, [groupedUpdates]);

  const navigationIdByDate = useMemo(() => {
    return new Map(
      groupedUpdates
        .map((group) => [
          getGroupDate(group)?.format("YYYY-MM-DD"),
          group.title,
        ])
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
  }, [groupedUpdates]);

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
      sidebarTopContentClassName="border-b mb-3"
      sidebar={updatesGroupedByMonth.map((monthGroup) => (
        <div key={monthGroup.monthYear} className="flex flex-col gap-0.5">
          {/* //TODO: like the NotesList.tsx, put this into a component, and then could be used by tasks page at some point. The headers are the same, so perhaps they could be put into a generic list header component */}
          <h3 className="text-slate-500 text-xs w-full tracking-wider font-medium px-2 pb-1 pt-2 border-dashed border-b border-slate-300">
            {monthGroup.monthYear}
          </h3>

          <ul className="flex flex-col gap-1">
            {monthGroup.items.map((item) => (
              <li
                key={item.title}
                className={cn(
                  "py-1 px-2 cursor-pointer rounded-lg transition-colors flex items-center gap-2 max-w-full",
                  colour.backgroundGlow,
                  colour.textPillInverted,
                )}
                onClick={() => {
                  navigate({ to: `#${item.navigationId}` });
                }}
              >
                <h2 className="text-sm min-w-0 overflow-x-hidden whitespace-nowrap overflow-ellipsis">
                  {item.title}
                </h2>

                <div className="flex items-center gap-1">
                  {item.icons.map((icon, index) => (
                    <Icon
                      key={`${item.title}-${icon.iconName}-${index}`}
                      iconName={icon.iconName}
                      size="sm"
                      className={icon.colour.text}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      content={
        <div className="h-full w-full max-w-[800px] flex flex-col gap-14 pb-6">
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

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
