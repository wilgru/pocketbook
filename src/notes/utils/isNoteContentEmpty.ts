import { getPlainTextFromLexicalContent } from "src/common/utils/lexicalContent";

export const isNoteContentEmpty = (noteContent: string): boolean => {
  return getPlainTextFromLexicalContent(noteContent).trim().length === 0;
};
