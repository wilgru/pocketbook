import type { Task, TasksGroup } from "src/tasks/tasks.schema";

const getGroup = (
  task: Task,
  groupBy: "created" | "note",
): {
  title: string;
  relevantTaskData: Partial<Task>;
}[] => {
  switch (groupBy) {
    case "created":
      return [
        {
          title: task.created.format("dddd MMMM D, YYYY"),
          relevantTaskData: {},
        },
      ];
    case "note": {
      if (task.note === null) {
        return [
          {
            title: "No Note",
            relevantTaskData: {
              noteId: null,
            },
          },
        ];
      }

      return [
        {
          title: task.note?.title || "Untitled Note",
          relevantTaskData: {
            note: task.note,
          },
        },
      ];
    }

    default:
      return [];
  }
};

export function groupTasks(
  tasks: Task[],
  groupBy: "created" | "note",
): TasksGroup[] {
  const groupedTasks = tasks.reduce((acc: TasksGroup[], task: Task) => {
    const groups = getGroup(task, groupBy);

    for (const group of groups) {
      const existingGroup = acc.find(
        (accGroup) => accGroup.title === group.title,
      );

      if (existingGroup) {
        existingGroup.tasks.push(task);
      } else {
        const newGroup: TasksGroup = {
          title: group.title,
          tasks: [task],
          relevantTaskData: {
            note: group.relevantTaskData.note,
          },
        };

        acc.push(newGroup);
      }
    }

    return acc;
  }, []);

  return groupedTasks.sort((a, b) => {
    const aIsNoNote = a.relevantTaskData.note === null;
    const bIsNoNote = b.relevantTaskData.note === null;
    if (aIsNoNote && !bIsNoNote) return -1;
    if (!aIsNoNote && bIsNoNote) return 1;
    return 0;
  });
}
