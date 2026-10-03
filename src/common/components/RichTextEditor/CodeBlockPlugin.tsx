import { $isCodeNode, getDefaultCodeLanguage } from "@lexical/code";
import {
  getCodeLanguageOptions,
  getLanguageFriendlyName,
  registerCodeHighlighting,
} from "@lexical/code-prism";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CaretDown, Check, Copy } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  $getNodeByKey,
  $getRoot,
  type LexicalEditor,
  type NodeKey,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownRadioGroup,
  DropdownRadioItem,
} from "src/common/components/Dropdown/Dropdown";

type CodeBlockInfo = {
  key: NodeKey;
  text: string;
  language: string;
  top: number;
  right: number;
};

const CodeBlockControls = ({
  editor,
  block,
  readOnly,
}: {
  editor: LexicalEditor;
  block: CodeBlockInfo;
  readOnly: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(block.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const setLanguage = (language: string) => {
    editor.update(() => {
      const node = $getNodeByKey(block.key);

      if ($isCodeNode(node)) {
        node.setLanguage(language);
      }
    });
  };

  const language = block.language || getDefaultCodeLanguage();

  return createPortal(
    <div
      className="code-block-controls"
      style={{ top: block.top, left: block.right }}
    >
      {readOnly ? (
        <span className="code-block-language">
          {getLanguageFriendlyName(language)}
        </span>
      ) : (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost-strong"
              shape="square"
              size="xs"
              className="code-block-control-button"
              ariaLabel="Select code language"
            >
              {getLanguageFriendlyName(language)}
              <CaretDown size={12} />
            </Button>
          </DropdownMenu.Trigger>
          <Dropdown
            align="end"
            side="bottom"
            sideOffset={4}
            className="max-h-64 min-w-36 overflow-y-auto"
          >
            <DropdownRadioGroup value={language} onValueChange={setLanguage}>
              {getCodeLanguageOptions()
                .filter(([value]) => value !== "clike")
                .map(([value, label]) => (
                  <DropdownRadioItem key={value} value={value}>
                    {label}
                  </DropdownRadioItem>
                ))}
            </DropdownRadioGroup>
          </Dropdown>
        </DropdownMenu.Root>
      )}
      <Button
        variant="ghost-strong"
        shape="square"
        size="xs"
        className="code-block-control-button"
        ariaLabel={copied ? "Code copied" : "Copy code"}
        onClick={copyCode}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </Button>
    </div>,
    document.body,
  );
};

export const CodeBlockPlugin = ({ readOnly }: { readOnly: boolean }) => {
  const [editor] = useLexicalComposerContext();
  const [blocks, setBlocks] = useState<CodeBlockInfo[]>([]);

  const updateCodeBlocks = useCallback(() => {
    const nextBlocks: CodeBlockInfo[] = [];

    editor.getEditorState().read(() => {
      for (const node of $getRoot().getChildren()) {
        if (!$isCodeNode(node)) {
          continue;
        }

        const element = editor.getElementByKey(node.getKey());

        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          continue;
        }

        nextBlocks.push({
          key: node.getKey(),
          text: node.getTextContent(),
          language: node.getLanguage() || getDefaultCodeLanguage(),
          top: rect.top + 4,
          right: rect.right - 4,
        });
      }
    });

    setBlocks(nextBlocks);
  }, [editor]);

  useEffect(() => registerCodeHighlighting(editor), [editor]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(updateCodeBlocks);
    const unregisterUpdateListener =
      editor.registerUpdateListener(updateCodeBlocks);

    window.addEventListener("resize", updateCodeBlocks);
    window.addEventListener("scroll", updateCodeBlocks, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      unregisterUpdateListener();
      window.removeEventListener("resize", updateCodeBlocks);
      window.removeEventListener("scroll", updateCodeBlocks, true);
    };
  }, [editor, updateCodeBlocks]);

  return blocks.map((block) => (
    <CodeBlockControls
      key={block.key}
      editor={editor}
      block={block}
      readOnly={readOnly}
    />
  ));
};
