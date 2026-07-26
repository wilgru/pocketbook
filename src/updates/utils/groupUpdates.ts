import type { Comment } from "src/comments/Comment.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { UpdateGroup, Update } from "src/updates/Update.type";

export const groupUpdates = (
  comments: Comment[],
  tasks: Task[],
  notes: Note[],
): UpdateGroup[] => {
  const commentUpdates: Update[] = comments.map((comment) => ({
    id: comment.id,
    type: "comment",
    action: "created",
    date: comment.created,
    data: comment,
  }));

  const taskUpdates: Update[] = tasks.reduce<Update[]>((acc, task) => {
    const date = task.completedDate ?? task.cancelledDate;
    if (!date) {
      return acc;
    }

    acc.push({
      id: task.id,
      type: "task",
      action: task.completedDate ? "completed" : "cancelled",
      date,
      data: task,
    });

    return acc;
  }, []);

  const noteUpdates: Update[] = notes.map((note) => ({
    id: note.id,
    type: "note",
    action: "created",
    date: note.created,
    data: note,
  }));

  const normalisedUpdates = [
    ...commentUpdates,
    ...taskUpdates,
    ...noteUpdates,
  ].sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const groupedUpdates: UpdateGroup[] = normalisedUpdates.reduce<UpdateGroup[]>(
    (acc, update) => {
      const groupDate = update.date.startOf("day");
      const existingGroup = acc.find((group) => group.date.isSame(groupDate));

      if (existingGroup) {
        existingGroup.updates.push(update);
      } else {
        acc.push({
          date: groupDate,
          updates: [update],
        });
      }

      return acc;
    },
    [],
  );

  // Sort each group's updates newest-first, then sort groups newest-first.
  groupedUpdates.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  return groupedUpdates;
};
