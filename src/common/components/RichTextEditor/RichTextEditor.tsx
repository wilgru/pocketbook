import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  HEADING,
  TRANSFORMERS,
  type ElementTransformer,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type EditorState,
  type LexicalEditor,
} from "lexical";
import { useEffect, useRef } from "react";
import { getColourHex } from "src/colours/utils/getColourHex";
import { cn } from "src/common/utils/cn";
import {
  createEmptyLexicalContent,
  normalizeLexicalContent,
} from "src/common/utils/lexicalContent";
import {
  getLexicalToolbarFormatting,
  type LexicalToolbarFormatting,
} from "src/common/utils/lexicalFormatting";
import type { CSSProperties } from "react";
import type { Colour } from "src/colours/Colour.type";

type RichTextSurfaceProps = {
  className?: string;
  style?: CSSProperties;
  colour?: Colour;
  size?: "sm" | "md";
  value?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onClick?: () => void;
  onChange?: (content: string) => void;
  onSelectedFormattingChange?: (formatting: LexicalToolbarFormatting) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEditorChange?: (editor: LexicalEditor | null) => void;
};

const HEADING_H1_H2: ElementTransformer = {
  ...HEADING,
  regExp: /^(#{1,2})\s/,
  export: (node, exportChildren) => {
    if (!$isHeadingNode(node)) {
      return null;
    }
    const level = Number(node.getTag().slice(1));
    if (level > 2) {
      return null;
    }
    return "#".repeat(level) + " " + exportChildren(node);
  },
  replace: (parentNode, children, match) => {
    const tag = ("h" + match[1].length) as HeadingTagType;
    const node = $createHeadingNode(tag);
    node.append(...children);
    parentNode.replace(node);
    node.select(0, node.getChildrenSize());
  },
};

const CUSTOM_TRANSFORMERS = [
  HEADING_H1_H2,
  ...TRANSFORMERS.filter((t) => t !== HEADING),
];

const theme = {
  paragraph: "editor-paragraph",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
  },
  quote: "editor-quote",
  text: {
    bold: "editor-text-bold",
    code: "editor-text-code",
    italic: "editor-text-italic",
    strikethrough: "editor-text-strikethrough",
    underline: "editor-text-underline",
  },
  link: "editor-link",
  code: "editor-code",
  list: {
    listitem: "editor-list-item",
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    nested: {
      listitem: "editor-list-item-nested",
    },
  },
};

const nodes = [
  CodeNode,
  HeadingNode,
  HorizontalRuleNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
];

const Placeholder = () => null;

const editorStateToString = (editorState: EditorState): string => {
  return JSON.stringify(editorState.toJSON());
};

const LexicalEditorBridge = ({
  value,
  readOnly = false,
  autoFocus = false,
  onChange,
  onSelectedFormattingChange,
  onFocus,
  onBlur,
  onEditorChange,
}: Omit<
  RichTextSurfaceProps,
  "className" | "style" | "colour" | "size" | "onClick"
>) => {
  const [editor] = useLexicalComposerContext();
  const lastSerializedValueRef = useRef<string>(normalizeLexicalContent(value));
  const hasAppliedInitialValueRef = useRef(false);
  const onEditorChangeRef = useRef(onEditorChange);
  onEditorChangeRef.current = onEditorChange;

  useEffect(() => {
    onEditorChangeRef.current?.(editor);

    return () => {
      onEditorChangeRef.current?.(null);
    };
  }, [editor]);

  useEffect(() => {
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    const nextValue = normalizeLexicalContent(value);

    if (!hasAppliedInitialValueRef.current) {
      hasAppliedInitialValueRef.current = true;
      lastSerializedValueRef.current = nextValue;
      return;
    }

    if (nextValue === lastSerializedValueRef.current) {
      return;
    }

    lastSerializedValueRef.current = nextValue;

    try {
      const nextEditorState = editor.parseEditorState(nextValue);
      editor.setEditorState(nextEditorState);
    } catch {
      const fallbackState = editor.parseEditorState(
        createEmptyLexicalContent(),
      );
      editor.setEditorState(fallbackState);
      lastSerializedValueRef.current = createEmptyLexicalContent();
    }
  }, [editor, value]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    editor.focus();
  }, [autoFocus, editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const serializedValue = editorStateToString(editorState);

      if (serializedValue !== lastSerializedValueRef.current) {
        lastSerializedValueRef.current = serializedValue;
        onChange?.(serializedValue);
      }

      onSelectedFormattingChange?.(getLexicalToolbarFormatting(editorState));
    });
  }, [editor, onChange, onSelectedFormattingChange]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        onSelectedFormattingChange?.(
          getLexicalToolbarFormatting(editor.getEditorState()),
        );
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, onSelectedFormattingChange]);

  return (
    <RichTextPlugin
      contentEditable={
        <ContentEditable
          className="editor-input outline-none h-full"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      }
      placeholder={<Placeholder />}
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
};

export const RichTextEditor = ({
  className,
  style,
  colour,
  size = "md",
  value,
  readOnly = false,
  autoFocus = false,
  onClick,
  onChange,
  onSelectedFormattingChange,
  onFocus,
  onBlur,
  onEditorChange,
}: RichTextSurfaceProps) => {
  const initialConfig = useRef({
    namespace: "PocketbookLexicalEditor",
    nodes,
    onError(error: Error) {
      throw error;
    },
    theme,
    editorState: normalizeLexicalContent(value),
  }).current;

  const linkColorStyle = colour
    ? ({ "--link-color": getColourHex(colour) } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn(
        "rich-text h-full placeholder-slate-500",
        size === "sm" && "rich-text-sm",
        className,
      )}
      style={{ ...linkColorStyle, ...style }}
      onClick={onClick}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <HistoryPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
        <TabIndentationPlugin
          $canIndent={(node) => node instanceof ListItemNode}
        />
        <LexicalEditorBridge
          value={value}
          readOnly={readOnly}
          autoFocus={autoFocus}
          onChange={onChange}
          onSelectedFormattingChange={onSelectedFormattingChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onEditorChange={onEditorChange}
        />
      </LexicalComposer>
    </div>
  );
};
