import * as Dialog from "@radix-ui/react-dialog";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
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
  const { todayTasks, pastCompletedTasks } = tasks.reduce<{
    todayTasks: Task[];
    pastCompletedTasks: Task[];
  }>(
    (acc, task) => {
      if (!task.completedDate && !task.cancelledDate) {
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
    { todayTasks: [], pastCompletedTasks: [] },
  );

  return (
    <div className="h-full w-full flex flex-col items-center">
      <Toolbar
        iconName="checkCircle"
        title="Tasks"
        colour={currentPocketbook?.colour}
        pocketbookColour={currentPocketbook?.colour}
      >
        <>
          <Button
            variant="ghost"
            size="sm"
            colour={currentPocketbook?.colour}
            iconName="listChecks"
            onClick={() => setCompletedModalOpen(true)}
          />
          <Button
            variant="ghost"
            size="sm"
            colour={currentPocketbook?.colour}
            iconName="plus"
            onClick={() => setNoNoteEditorTrigger((c) => c + 1)}
          />
        </>
      </Toolbar>

      <Dialog.Root
        open={completedModalOpen}
        onOpenChange={setCompletedModalOpen}
      >
        <TasksLayout
          tasks={todayTasks}
          colour={currentPocketbook?.colour}
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
