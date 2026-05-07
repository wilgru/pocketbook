import { atom } from "jotai";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";

type TaskEditorState = {
  isTaskFocused: boolean;
  colour: Colour | undefined;
  isFlagged: boolean;
  dueDate: Dayjs | null;
  isCompleted: boolean;
  isCancelled: boolean;
  onLinkClick: (() => void) | null;
  onFlagClick: (() => void) | null;
  onDueDateChange: ((date: Dayjs | null) => void) | null;
  onDatePickerOpenChange: ((open: boolean) => void) | null;
  onDeleteClick: (() => void) | null;
};

export const defaultTaskEditorState: TaskEditorState = {
  isTaskFocused: false,
  colour: undefined,
  isFlagged: false,
  dueDate: null,
  isCompleted: false,
  isCancelled: false,
  onLinkClick: null,
  onFlagClick: null,
  onDueDateChange: null,
  onDatePickerOpenChange: null,
  onDeleteClick: null,
};

export const taskEditorStateAtom = atom<TaskEditorState>(defaultTaskEditorState);
