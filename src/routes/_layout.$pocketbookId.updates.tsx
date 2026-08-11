import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { useGetComments } from "src/comments/hooks/useGetComments";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";
import { UpdatesLayout } from "src/updates/components/UpdatesLayout/UpdatesLayout";

export const Route = createFileRoute("/_layout/$pocketbookId/updates")({
  component: UpdatesComponent,
  beforeLoad: async ({ location }) => {
    requireClientAuth(location);
  },
});

function UpdatesComponent() {
  const { currentPocketbook } = useCurrentPocketbook();
  const { comments } = useGetComments();
  const { notes } = useGetNotes({});
  const { tasks } = useGetTasks({});
  const [pendingNew, setPendingNew] = useState(false);

  return (
    <div className="h-full w-full flex flex-col items-center">
      <Toolbar
        iconName="calendarDots"
        title="History"
        colour={currentPocketbook?.colour}
      >
        <Button
          variant="ghost"
          size="sm"
          colour={currentPocketbook?.colour}
          iconName="chatCenteredText"
          onClick={() => setPendingNew(true)}
        />
      </Toolbar>

      <UpdatesLayout
        notes={notes}
        tasks={tasks}
        comments={comments}
        colour={currentPocketbook?.colour}
        pendingNew={pendingNew}
        onCreateNew={() => setPendingNew(true)}
        onCancelNew={() => setPendingNew(false)}
      />
    </div>
  );
}
