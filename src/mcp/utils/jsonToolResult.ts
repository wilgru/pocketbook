/**
 * Wraps a JSON-serialisable value in the MCP `CallToolResult` content shape.
 * `Dayjs` values are serialised to ISO strings via their own `toJSON` method.
 */
export function jsonToolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
