const EMPTY_LEXICAL_CONTENT = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

const extractPlainText = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractPlainText).join("");
  }

  if (typeof value !== "object" || value === null) {
    return "";
  }

  const maybeNode = value as {
    children?: unknown;
    text?: unknown;
  };

  if (typeof maybeNode.text === "string") {
    return maybeNode.text;
  }

  return extractPlainText(maybeNode.children);
};

export const createEmptyLexicalContent = (): string => {
  return EMPTY_LEXICAL_CONTENT;
};

export const normalizeLexicalContent = (
  content: string | null | undefined,
): string => {
  if (!content) {
    return EMPTY_LEXICAL_CONTENT;
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (typeof parsed === "object" && parsed !== null && "root" in parsed) {
      return JSON.stringify(parsed);
    }
  } catch {
    return EMPTY_LEXICAL_CONTENT;
  }

  return EMPTY_LEXICAL_CONTENT;
};

export const getPlainTextFromLexicalContent = (
  content: string | null | undefined,
): string => {
  if (!content) {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(content);

    if (typeof parsed === "object" && parsed !== null && "root" in parsed) {
      const root = (parsed as { root?: unknown }).root;

      if (root && typeof root === "object") {
        return extractPlainText((root as { children?: unknown }).children)
          .split("\u0000").join("")
          .trimEnd();
      }
    }
  } catch {
    return "";
  }

  return "";
};
