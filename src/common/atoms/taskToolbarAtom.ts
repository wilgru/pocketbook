import { atom } from "jotai";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/Task.type";

type TaskToolbarAtom = {
  task: Task | null;
  tasksForSorting: Task[] | undefined;
  onUpdateTask: ((updateTaskData: Partial<Task>) => void) | undefined;
  refocusRef: React.RefObject<HTMLTextAreaElement> | null;
  isVisible: boolean;
  isToolbarBusy: boolean;
  colour: Colour | undefined;
};

export const defaultTaskToolbarAtom: TaskToolbarAtom = {
  task: null,
  tasksForSorting: undefined,
  onUpdateTask: undefined,
  refocusRef: null,
  isVisible: false,
  isToolbarBusy: false,
  colour: undefined,
};

export const taskToolbarAtom = atom<TaskToolbarAtom>(defaultTaskToolbarAtom);
