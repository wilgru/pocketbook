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
        // When the editor does not have focus (e.g. during a note switch),
        // Quill's setContents → setNativeRange path calls root.focus() because
        // hasFocus() returns false. That premature focus event fires our focus
        // handler and gets isFocusedRef stuck at true before the user has
        // actually clicked in the new note. Clear the DOM selection first so
        // Quill sees no range to restore and skips the root.focus() call.
        if (!quillEditor.hasFocus()) {
          document.getSelection()?.removeAllRanges();
        }
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

        // Use selection-change to detect focus: Quill emits this after the
        // user clicks in the editor and resolves the selection, meaning the
        // range is always valid when we read it. Native "focus" fires too
        // early (including during programmatic setContents → root.focus()
        // calls) and gets isFocusedRef stuck between note switches.
        if (!isFocusedRef.current) {
          isFocusedRef.current = true;
          onFocusRef.current?.();
        }
      }
    };

    // Use a native DOM blur listener for blur detection. In Chromium/Electron
    // the contenteditable selection is preserved after the element loses focus,
    // so Quill's selection-change(null) never fires reliably on blur. The
    // native blur event does fire, letting us reset isFocusedRef so the next
    // selection-change(range) correctly re-triggers onFocus.
    const handleEditorBlur = () => {
      if (isFocusedRef.current) {
        isFocusedRef.current = false;
        onBlurRef.current?.();
      }
    };

    quillEditor.on("text-change", handleTextChange);
    quillEditor.on("selection-change", handleSelectionChange);
    quillEditor.root.addEventListener("blur", handleEditorBlur);

    return () => {
      quillEditor?.off("text-change", handleTextChange);
      quillEditor?.off("selection-change", handleSelectionChange);
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
