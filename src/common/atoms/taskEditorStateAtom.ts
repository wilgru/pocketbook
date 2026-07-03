import { atom } from "jotai";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/Note.type";

type TaskEditorState = {
  focusedTaskEditorId: string | null;
  isTaskFocused: boolean;
  colour: Colour | undefined;
  links: Link[];
  selectedNote: Note | null;
  isImportant: boolean;
  dueDate: Dayjs | null;
  isCompleted: boolean;
  isCancelled: boolean;
  onNoteChange: ((note: Note | null) => void) | null;
  onNoteSelectOpenChange: ((open: boolean) => void) | null;
  onLinksChange: ((links: Link[]) => void) | null;
  onLinkPopoverOpenChange: ((open: boolean) => void) | null;
  onFlagClick: (() => void) | null;
  onDueDateChange: ((date: Dayjs | null) => void) | null;
  onDatePickerOpenChange: ((open: boolean) => void) | null;
  onDeleteClick: (() => void) | null;
  onMoveUp: (() => void) | null;
  onMoveDown: (() => void) | null;
};

export const defaultTaskEditorState: TaskEditorState = {
  focusedTaskEditorId: null,
  isTaskFocused: false,
  colour: undefined,
  links: [],
  selectedNote: null,
  isImportant: false,
  dueDate: null,
  isCompleted: false,
  isCancelled: false,
  onNoteChange: null,
  onNoteSelectOpenChange: null,
  onLinksChange: null,
  onLinkPopoverOpenChange: null,
  onFlagClick: null,
  onDueDateChange: null,
  onDatePickerOpenChange: null,
  onDeleteClick: null,
  onMoveUp: null,
  onMoveDown: null,
};

export const taskEditorStateAtom = atom<TaskEditorState>(defaultTaskEditorState);
