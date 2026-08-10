import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { ListSection } from "src/common/components/ListSection/ListSection";
import { PaneWithInspectorLayout } from "src/common/components/PaneWithInspectorLayout/PaneWithInspectorLayout";
import { TableOfContentsListItem } from "src/common/components/TableOfContentsListItem/TableOfContentsListItem";
import { groupTasks } from "src/tasks/utils/groupTasks";
import { TasksSection } from "../TasksSection/TasksSection";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/Task.type";

export type TasksLayoutSection<T> = {
  title: string;
  prefillNewData?: Partial<T>;
  children: React.ReactNode;
};

type TasksLayoutProps = {
  colour?: Colour;
  tasks: Task[];
  noNoteEditorTrigger?: number;
};

export const TasksLayout = ({
  colour = colours.orange,
  tasks,
  noNoteEditorTrigger,
}: TasksLayoutProps) => {
  const groupedTasks = useMemo(
    () =>
      groupTasks(tasks, "note").filter((group) =>
        group.tasks.some((task) => !task.completedDate && !task.cancelledDate),
      ),
    [tasks],
  );

  // When the toolbar plus button is clicked and there's no "No Note" group yet, synthesise one so TasksSection can receive the trigger and create a task.
  const effectiveTaskGroups = useMemo(() => {
    const hasNoNoteGroup = groupedTasks.some(
      (g) => g.relevantTaskData.note === null,
    );

    const groups =
      !hasNoNoteGroup &&
      noNoteEditorTrigger !== undefined &&
      noNoteEditorTrigger > 0
        ? [
            {
              title: "No Note",
              tasks: [] as Task[],
              navigationId: "no-note",
              relevantTaskData: { note: null as null },
            },
            ...groupedTasks,
          ]
        : groupedTasks;

    return groups.map((group) => ({
      ...group,
      navigationId: group.relevantTaskData.note?.id ?? "no-note",
    }));
  }, [groupedTasks, noNoteEditorTrigger]);

  return (
    <PaneWithInspectorLayout
      sidebar={
        <ListSection>
          {effectiveTaskGroups.map((effectiveGroup) => (
            <TableOfContentsListItem
              key={effectiveGroup.navigationId}
              title={effectiveGroup.title}
              navigationId={effectiveGroup.navigationId}
              onJumpTo={() => undefined}
              colour={colour}
            >
              <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                {
                  effectiveGroup.tasks.filter(
                    (task) => !task.completedDate && !task.cancelledDate,
                  ).length // TODO: move this calculation to the groupTasks util so we don't have to do it here
                }
              </span>
            </TableOfContentsListItem>
          ))}
        </ListSection>
      }
      content={
        <div className="h-full w-full max-w-200 flex flex-col gap-6">
          {effectiveTaskGroups.length === 0 && (
            <EmptyState text="No tasks yet" />
          )}

          {effectiveTaskGroups.map((group) => (
            <TasksSection
              key={group.navigationId}
              taskGroup={group}
              colour={colour}
              noNoteEditorTrigger={
                group.relevantTaskData.note === null
                  ? noNoteEditorTrigger
                  : undefined
              }
            />
          ))}

          <div aria-hidden="true" className="h-10 w-full shrink-0" />
        </div>
      }
    />
  );
};
