import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getColourHex } from "src/colours/utils/getColourHex";
import {
  createLinkHandler,
  createListHandler,
  createToggleHandler,
} from "./quillFormatHandlers";
import type Quill from "quill";
import type { RangeStatic, StringMap } from "quill";
import type Delta from "quill-delta";
import type { Colour } from "src/colours/Colour.type";

type QuillEditorProps = {
  toolbarId: string;
  value?: Delta;
  colour?: Colour;
  autoFocus?: boolean;
  onChange: (delta: Delta) => void;
  onSelectedFormattingChange: (selectionFormatting: StringMap) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

// https://quilljs.com/docs/modules/toolbar/
// https://quilljs.com/docs/api#formatting
// https://medium.com/@mircea.calugaru/react-quill-editor-with-full-toolbar-options-and-custom-buttons-undo-redo-176d79f8d375

// TODO: override quills internal value updating? make this comp more like textarea, pass value and onChange and use onChange to update a state to pass to the value
const QuillEditor = ({
  toolbarId,
  value,
  colour,
  autoFocus = false,
  onChange,
  onSelectedFormattingChange,
  onFocus,
  onBlur,
}: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const autoFocusRef = useRef(autoFocus);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const onSelectedFormattingChangeRef = useRef(onSelectedFormattingChange);
  const isFocusedRef = useRef(false);
  const [quillEditor, setQuillEditor] = useState<Quill | null>(null);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
    onSelectedFormattingChangeRef.current = onSelectedFormattingChange;
  });

  useEffect(() => {
    if (!quillEditor) return;
    if (value === undefined) return;

    const current = quillEditor.getContents();
    try {
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        quillEditor.setContents(value, "api");
      }
    } catch {
      quillEditor.setContents(value, "api");
    }
  }, [value, quillEditor]);

  useEffect(() => {
    if (!quillEditor) return;

    const handleTextChange = (
      _delta: Delta,
      _oldDelta: Delta,
      source: string,
    ) => {
      const selection = quillEditor.getSelection();

      if (selection) {
        const selectionFormatting = quillEditor.getFormat(
          selection.index,
          selection.length,
        );

        onSelectedFormattingChangeRef.current?.(selectionFormatting);
      }

      // Only notify consumers for user-driven changes (like a textarea)
      if (source === "user") {
        onChangeRef.current?.(quillEditor.getContents());
      }
    };

    const handleSelectionChange = (range: RangeStatic) => {
      if (range) {
        const selectionFormatting = quillEditor.getFormat(
          range.index,
          range.length,
        );

        onSelectedFormattingChangeRef.current?.(selectionFormatting);
      }
    };

    // Use native DOM focus/blur events instead of Quill's selection-change to
    // detect focus transitions. In Chromium (and Electron), the contenteditable
    // element's DOM selection is preserved after blur, which causes
    // selection-change(null) to never fire — leaving isFocusedRef stuck at
    // true and the toolbar permanently hidden after a note switch.
    const handleEditorFocus = () => {
      if (!isFocusedRef.current) {
        isFocusedRef.current = true;
        onFocusRef.current?.();
      }
    };

    const handleEditorBlur = () => {
      if (isFocusedRef.current) {
        isFocusedRef.current = false;
        onBlurRef.current?.();
      }
    };

    quillEditor.on("text-change", handleTextChange);
    quillEditor.on("selection-change", handleSelectionChange);
    quillEditor.root.addEventListener("focus", handleEditorFocus);
    quillEditor.root.addEventListener("blur", handleEditorBlur);

    return () => {
      quillEditor?.off("text-change", handleTextChange);
      quillEditor?.off("selection-change", handleSelectionChange);
      quillEditor.root.removeEventListener("focus", handleEditorFocus);
      quillEditor.root.removeEventListener("blur", handleEditorBlur);
    };
  }, [quillEditor]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isMounted = true;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );

    const initializeEditor = async () => {
      const { default: QuillConstructor } = await import("quill");

      if (!isMounted) {
        return;
      }

      const quill: Quill = new QuillConstructor(editorContainer, {
        // debug: import.meta.env.DEV ? "info" : undefined, // TODO: add back in with dev tools
        // placeholder: "No content",
        modules: {
          toolbar: {
            container: `#${toolbarId}`,
            handlers: {
              bold: createToggleHandler(() => quill, "bold"),
              italic: createToggleHandler(() => quill, "italic"),
              underline: createToggleHandler(() => quill, "underline"),
              strike: createToggleHandler(() => quill, "strike"),
              code: createToggleHandler(() => quill, "code"),
              list: createListHandler(() => quill),
              blockquote: createToggleHandler(() => quill, "blockquote"),
              "code-block": createToggleHandler(() => quill, "code-block"),
              link: createLinkHandler(() => quill),
            },
          },
        },
        formats: [
          "bold",
          "italic",
          "underline",
          "strike",
          "code",
          "list",
          "indent",
          "blockquote",
          "code-block",
          "link",
        ],
      });

      const handleLinkClick = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement).closest("a");

        if (anchor?.href) {
          e.preventDefault();
          window.open(anchor.href, "_blank", "noopener,noreferrer");
        }
      };

      editorContainer.addEventListener("click", handleLinkClick);
      setQuillEditor(quill);

      if (autoFocusRef.current) {
        quill.focus();
      }

      return () => {
        editorContainer.removeEventListener("click", handleLinkClick);
      };
    };

    let cleanupLinks: (() => void) | undefined;
    initializeEditor().then((cleanup) => {
      cleanupLinks = cleanup;
    });

    return () => {
      isMounted = false;
      cleanupLinks?.();
      container.innerHTML = "";

      setQuillEditor(null);
    };
  }, [toolbarId]);

  return (
    <div
      id="quill-editor"
      ref={containerRef}
      className="w-full h-fit placeholder-slate-500 px-1"
      style={
        colour
          ? ({ "--ql-link-color": getColourHex(colour) } as React.CSSProperties)
          : undefined
      }
    />
  );
};

export { QuillEditor };
