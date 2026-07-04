import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useMemo, Fragment } from "react";
import { colours } from "src/colours/colours.constant";
import { ListSection } from "src/common/ListSection/ListSection";
import { TableOfContentsListItem } from "src/common/TableOfContentsListItem/TableOfContentsListItem";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { FloatingToolbar } from "src/common/components/FloatingToolbar/FloatingToolbar";
import { TwoPaneLayout } from "src/common/components/TwoPaneLayout/TwoPaneLayout";
import { TaskFloatingToolbar } from "src/tasks/components/TaskFloatingToolbar/TaskFloatingToolbar";
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
  const navigate = useNavigate();
  const { isTaskFocused } = useAtomValue(taskEditorStateAtom);
  const groupedTasks = useMemo(() => groupTasks(tasks, "note"), [tasks]);

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
      navigationId: group.title,
    }));
  }, [groupedTasks, noNoteEditorTrigger]);

  return (
    <TwoPaneLayout
      sidebar={
        <ListSection>
          {effectiveTaskGroups.map((effectiveGroup) => (
            <TableOfContentsListItem
              key={effectiveGroup.navigationId}
              title={effectiveGroup.title}
              navigationId={effectiveGroup.navigationId}
              onJumpTo={(id) => navigate({ to: `#${id}` })}
              colour={colour}
            />
          ))}
        </ListSection>
      }
      content={
        <>
          <div className="h-full w-full max-w-[800px] flex flex-col gap-6">
            {effectiveTaskGroups.length === 0 && (
              <EmptyState text="No tasks yet" />
            )}

            {effectiveTaskGroups.map((group, index) => (
              <Fragment key={group.relevantTaskData.note?.id ?? "no-note"}>
                {index > 0 && <hr className="border-slate-200" />}
                <TasksSection
                  taskGroup={group}
                  colour={colour}
                  noNoteEditorTrigger={
                    group.relevantTaskData.note === null
                      ? noNoteEditorTrigger
                      : undefined
                  }
                />
              </Fragment>
            ))}
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none z-30">
            <FloatingToolbar visible={isTaskFocused}>
              <TaskFloatingToolbar />
            </FloatingToolbar>
          </div>
        </>
      }
    />
  );
};
