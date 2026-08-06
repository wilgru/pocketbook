import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { TasksLayout } from "src/tasks/components/TasksLayout/TasksLayout";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";

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
            iconName="plus"
            onClick={() => setNoNoteEditorTrigger((c) => c + 1)}
          />
        </>
      </Toolbar>

      <TasksLayout
        tasks={tasks}
        colour={currentPocketbook?.colour}
        noNoteEditorTrigger={noNoteEditorTrigger}
      />
    </div>
  );
}
