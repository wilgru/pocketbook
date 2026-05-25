import { $isCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { $isQuoteNode } from "@lexical/rich-text";
import {
  $getSelection,
  $isRangeSelection,
  type EditorState,
  type LexicalNode,
} from "lexical";

export type LexicalToolbarFormatting = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  ordered?: boolean;
  bullet?: boolean;
  blockquote?: boolean;
  codeBlock?: boolean;
  link?: boolean;
};

const hasAncestor = (
  node: LexicalNode,
  predicate: (ancestor: LexicalNode) => boolean,
): boolean => {
  let currentNode: LexicalNode | null = node;

  while (currentNode) {
    if (predicate(currentNode)) {
      return true;
    }

    currentNode = currentNode.getParent();
  }

  return false;
};

const hasListType = (node: LexicalNode, listType: "bullet" | "number") => {
  return hasAncestor(node, (ancestor) => {
    if (!$isListItemNode(ancestor)) {
      return false;
    }

    const listNode = ancestor.getParent();
    return $isListNode(listNode) && listNode.getListType() === listType;
  });
};

export const getLexicalToolbarFormatting = (
  editorState: EditorState,
): LexicalToolbarFormatting => {
  let formatting: LexicalToolbarFormatting = {};

  editorState.read(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    const selectedNodes = selection.getNodes();

    formatting = {
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strike: selection.hasFormat("strikethrough"),
      code: selection.hasFormat("code"),
      ordered: selectedNodes.some((node) => hasListType(node, "number")),
      bullet: selectedNodes.some((node) => hasListType(node, "bullet")),
      blockquote: selectedNodes.some((node) => hasAncestor(node, $isQuoteNode)),
      codeBlock: selectedNodes.some((node) => hasAncestor(node, $isCodeNode)),
      link: selectedNodes.some((node) => hasAncestor(node, $isLinkNode)),
    };
  });

  return formatting;
};
