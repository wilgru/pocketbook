import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import { UpdatesLayout } from "src/updates/components/UpdatesLayout/UpdatesLayout";

export const Route = createFileRoute("/_layout/$pocketbookId/updates")({
  component: UpdatesComponent,
  beforeLoad: async ({ location }) => {
    requireClientAuth(location);
  },
});

function UpdatesComponent() {
  const { pocketbookId } = Route.useParams();
  const { currentPocketbook } = useCurrentPocketbook();

  const { data: commentsData } = useServerQuery(getCommentsServerFn, {
    pocketbookId,
  });
  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
  });
  const { data: tasksData } = useServerQuery(getTasksServerFn, {
    pocketbookId,
  });

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
        notes={notesData?.notes ?? []}
        tasks={tasksData?.tasks ?? []}
        comments={commentsData?.comments ?? []}
        colour={currentPocketbook?.colour}
        pendingNew={pendingNew}
        onCreateNew={() => setPendingNew(true)}
        onCancelNew={() => setPendingNew(false)}
      />
    </div>
  );
}
