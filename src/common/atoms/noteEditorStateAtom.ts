import { atom } from "jotai";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type NoteEditorState = {
  isEditorFocused: boolean;
  editor: LexicalEditor | null;
  toolbarFormatting: LexicalToolbarFormatting | undefined;
  colour: Colour | undefined;
};

export const noteEditorStateAtom = atom<NoteEditorState>({
  isEditorFocused: false,
  editor: null,
  toolbarFormatting: undefined,
  colour: undefined,
});
