import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, $toggleLink, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createQuoteNode, $isQuoteNode } from "@lexical/rich-text";
import {
  type BaseSelection,
  type ElementNode,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";

const toggleBlockNode = (
  editor: LexicalEditor,
  createNode: () => ElementNode,
  isTargetNode: (node: ElementNode) => boolean,
): void => {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    const selectedTopLevelNodes = new Map<string, ElementNode>();

    selection.getNodes().forEach((node) => {
      const topLevelNode = node.getTopLevelElementOrThrow();

      selectedTopLevelNodes.set(
        topLevelNode.getKey(),
        topLevelNode as ElementNode,
      );
    });

    selectedTopLevelNodes.forEach((node) => {
      if (isTargetNode(node)) {
        const paragraphNode = $createParagraphNode();
        const children = node.getChildren();

        children.forEach((child) => {
          paragraphNode.append(child);
        });

        node.replace(paragraphNode);
        return;
      }

      if (node.getType() !== "paragraph") {
        return;
      }

      const replacementNode = createNode();
      const children = node.getChildren();

      children.forEach((child) => {
        replacementNode.append(child);
      });

      node.replace(replacementNode);
    });
  });
};

const isSelectionInLink = (editor: LexicalEditor): boolean => {
  let hasLink = false;

  editor.getEditorState().read(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    hasLink = selection.getNodes().some((node) => {
      let currentNode: LexicalNode | null = node;

      while (currentNode) {
        if ($isLinkNode(currentNode)) {
          return true;
        }

        currentNode = currentNode.getParent() as LexicalNode | null;
      }

      return false;
    });
  });

  return hasLink;
};

const isSelectionInList = (
  editor: LexicalEditor,
  listType: "bullet" | "number",
): boolean => {
  let hasList = false;

  editor.getEditorState().read(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    hasList = selection.getNodes().some((node) => {
      let currentNode: LexicalNode | null = node;

      while (currentNode) {
        if ($isListItemNode(currentNode)) {
          const parent = currentNode.getParent();

          if ($isListNode(parent) && parent.getListType() === listType) {
            return true;
          }
        }

        currentNode = currentNode.getParent() as LexicalNode | null;
      }

      return false;
    });
  });

  return hasList;
};

export const executeLexicalToolbarAction = (
  editor: LexicalEditor | null,
  value: string,
  url?: string,
  savedSelection?: BaseSelection | null,
): void => {
  if (!editor) {
    return;
  }

  switch (value) {
    case "bold":
    case "italic":
    case "underline":
    case "code":
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, value);
      return;
    case "strike":
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
      return;
    case "ordered":
      editor.dispatchCommand(
        isSelectionInList(editor, "number")
          ? REMOVE_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    case "bullet":
      editor.dispatchCommand(
        isSelectionInList(editor, "bullet")
          ? REMOVE_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    case "blockquote":
      toggleBlockNode(editor, () => $createQuoteNode(), $isQuoteNode);
      return;
    case "code-block":
      toggleBlockNode(editor, () => $createCodeNode(), $isCodeNode);
      return;
    case "link": {
      if (isSelectionInLink(editor)) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        return;
      }

      if (!url) {
        return;
      }

      try {
        const parsed = new URL(url);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return;
        }
      } catch {
        return;
      }

      editor.update(() => {
        if (savedSelection) {
          $setSelection(savedSelection);
        }
        $toggleLink(url);
      });
      editor.focus();
      return;
    }
    default:
      return;
  }
};
