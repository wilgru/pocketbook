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
import { buildUpdatesPageData } from "src/updates/utils/buildUpdatesPageData";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { Update } from "src/updates/Update.type";

type UpdatesLayoutProps = {
  updates: Update[];
  notes: Note[];
  tasks: Task[];
  colour?: Colour;
  pendingNew?: boolean;
  onCancelNew?: () => void;
  onCreateNew?: () => void;
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
  const pageData = useMemo(
    () => buildUpdatesPageData({ updates, notes, tasks }),
    [updates, notes, tasks],
  );

  return (
    <TwoPaneLayout
      sidebarTopContent={
        <Calendar
          colour={colour}
          size="sm"
          showSelectedDate={false}
          dayDotIndicators={pageData.dayDotIndicators}
          isDateDisabled={(date) =>
            !pageData.availableDateKeys.has(
              date.startOf("day").format("YYYY-MM-DD"),
            )
          }
          onSelectDate={(date) => {
            const dateKey = date.startOf("day").format("YYYY-MM-DD");
            const targetNavigationId = pageData.navigationIdByDate.get(dateKey);
            if (!targetNavigationId) return;
            navigate({ to: `#${targetNavigationId}` });
          }}
        />
      }
      showSidebarTopContentDivider
      sidebar={pageData.sidebarMonthGroups.map((monthGroup) => (
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
        <div className="h-full w-full max-w-[800px] flex flex-col gap-10 pb-6">
          {pendingNew && (
            <UpdateEditor
              update={{ notes: [], tint: null }}
              colour={colour}
              onCancel={onCancelNew}
              onCreated={onCancelNew}
            />
          )}

          {pageData.sections.map((section) => (
            <UpdatesSection
              key={section.navigationId}
              group={section.group}
              colour={colour}
              notes={section.notes}
              tasks={section.tasks}
            />
          ))}

          {pageData.sections.length === 0 && !pendingNew && (
            <EmptyState text="No updates yet" onAdd={onCreateNew} />
          )}

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
