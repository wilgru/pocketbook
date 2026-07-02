import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { TaskSchema } from "src/tasks/tasks.schema";

dayjs.extend(utc);

type MapTaskOptions = {
  note?: Note | null;
};

export const mapTask = (
  task: TaskSchema,
  options: MapTaskOptions = {},
): Task => {
  let links: Link[] = [];
  try {
    links = JSON.parse(task.links || "[]");
  } catch {
    links = [];
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    link: task.link || null,
    isImportant: task.isImportant,
    note: options.note ?? null,
    links,
    sortOrder: task.sortOrder,
    dueDate: task.dueDate ? dayjs.utc(task.dueDate).local() : null,
    completedDate: task.completedDate
      ? dayjs.utc(task.completedDate).local()
      : null,
    cancelledDate: task.cancelledDate
      ? dayjs.utc(task.cancelledDate).local()
      : null,
    created: dayjs.utc(task.created).local(),
    updated: dayjs.utc(task.updated).local(),
  };
};
