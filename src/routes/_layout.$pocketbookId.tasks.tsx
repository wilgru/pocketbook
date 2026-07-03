import * as Dialog from "@radix-ui/react-dialog";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { CompletedTasksModal } from "src/tasks/components/CompletedTasksModal/CompletedTasksModal";
import { TasksLayout } from "src/tasks/components/TasksLayout/TasksLayout";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";
import type { Task } from "src/tasks/Task.type";

export const Route = createFileRoute("/_layout/$pocketbookId/tasks")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    requireClientAuth(location);
  },
});

function RouteComponent() {
  const { currentPocketbook } = useCurrentPocketbook();

  const { tasks } = useGetTasks({});
  const [noNoteEditorTrigger, setNoNoteEditorTrigger] = useState(0);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  const today = dayjs();
  const { incompleteTasks, todayTasks, pastCompletedTasks } =
    tasks.reduce<{
      incompleteTasks: Task[];
      todayTasks: Task[];
      pastCompletedTasks: Task[];
    }>(
      (acc, task) => {
        if (!task.completedDate && !task.cancelledDate) {
          acc.incompleteTasks.push(task);
          acc.todayTasks.push(task);
        } else if (
          (task.completedDate && task.completedDate.isSame(today, "day")) ||
          (task.cancelledDate && task.cancelledDate.isSame(today, "day"))
        ) {
          acc.todayTasks.push(task);
        } else {
          acc.pastCompletedTasks.push(task);
        }
        return acc;
      },
      { incompleteTasks: [], todayTasks: [], pastCompletedTasks: [] },
    );

  return (
    <div className="h-full w-full flex flex-col items-center">
      <Toolbar
        iconName="checkCircle"
        title="Tasks"
        colour={currentPocketbook?.colour}
        pocketbookColour={currentPocketbook?.colour}
      >
        <Button
          variant="ghost"
          size="sm"
          colour={currentPocketbook?.colour}
          iconName="plus"
          onClick={() => setNoNoteEditorTrigger((c) => c + 1)}
        />
      </Toolbar>

      <Dialog.Root
        open={completedModalOpen}
        onOpenChange={setCompletedModalOpen}
      >
        <TasksLayout
          header={
            <div className="flex gap-3">
              <Icon
                className={cn("pb-1", currentPocketbook?.colour?.text)}
                iconName="checkCircle"
                size="xl"
              />

              <h1 className="font-title text-5xl">Tasks</h1>
            </div>
          }
          title="Tasks"
          tasks={todayTasks}
          colour={currentPocketbook?.colour}
          badges={[`${incompleteTasks.length} tasks`]}
          actionBadges={
            pastCompletedTasks.length > 0
              ? [
                  {
                    label: `${pastCompletedTasks.length} done`,
                    onClick: () => setCompletedModalOpen(true),
                  },
                ]
              : []
          }
          noNoteEditorTrigger={noNoteEditorTrigger}
        />

        <CompletedTasksModal
          tasks={pastCompletedTasks}
          colour={currentPocketbook?.colour}
        />
      </Dialog.Root>
    </div>
  );
}
