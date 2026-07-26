import { atom } from "jotai";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type NoteToolbarAtom = {
  editorContext: LexicalEditor | null;
  isVisible: boolean;
  isToolbarBusy: boolean;
  toolbarFormatting: LexicalToolbarFormatting | undefined;
  colour: Colour | undefined;
};

export const defaultNoteToolbarAtom: NoteToolbarAtom = {
  editorContext: null,
  isVisible: false,
  isToolbarBusy: false,
  toolbarFormatting: undefined,
  colour: undefined,
};

export const NoteToolbarAtom = atom<NoteToolbarAtom>(defaultNoteToolbarAtom);
