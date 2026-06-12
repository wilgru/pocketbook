import { atom } from "jotai";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";

type TaskEditorState = {
  isTaskFocused: boolean;
  colour: Colour | undefined;
  isImportant: boolean;
  dueDate: Dayjs | null;
  isCompleted: boolean;
  isCancelled: boolean;
  onLinkClick: (() => void) | null;
  onFlagClick: (() => void) | null;
  onDueDateChange: ((date: Dayjs | null) => void) | null;
  onDatePickerOpenChange: ((open: boolean) => void) | null;
  onDeleteClick: (() => void) | null;
  onMoveUp: (() => void) | null;
  onMoveDown: (() => void) | null;
};

export const defaultTaskEditorState: TaskEditorState = {
  isTaskFocused: false,
  colour: undefined,
  isImportant: false,
  dueDate: null,
  isCompleted: false,
  isCancelled: false,
  onLinkClick: null,
  onFlagClick: null,
  onDueDateChange: null,
  onDatePickerOpenChange: null,
  onDeleteClick: null,
  onMoveUp: null,
  onMoveDown: null,
};

export const taskEditorStateAtom = atom<TaskEditorState>(defaultTaskEditorState);
