/**
 * MCP Response Interfaces based on standard Model Context Protocol CallToolResult
 */
export interface MCPContentText {
  type: "text";
  text: string;
}

export interface MCPContentOther {
  type: string;
  [key: string]: unknown;
}

export type MCPContentItem = MCPContentText | MCPContentOther;

export interface MCPCallToolResponse {
  isError?: boolean;
  content?: MCPContentItem[];
  [key: string]: unknown;
}

export class MCPResponseError extends Error {
  public response: MCPCallToolResponse;
  public rawText?: string;

  constructor(message: string, response: MCPCallToolResponse, rawText?: string) {
    super(message);
    this.name = "MCPResponseError";
    this.response = response;
    this.rawText = rawText;
  }
}

/**
 * parseMCPResponse:
 * Strict response contract parser for Model Context Protocol (MCP) tool calls.
 *
 * Rules:
 * 1. Checks `response.isError === true` FIRST before attempting any JSON parsing.
 * 2. If isError is true, extracts the error message from content[0].text (which is plain text error, not JSON),
 *    and throws a clean MCPResponseError.
 * 3. Verifies that response.content is an array and content[0].text is present.
 * 4. Parses content[0].text as JSON and returns the strongly typed payload.
 * 5. If JSON parsing fails on a non-error response, throws a clear diagnostic error with the raw text.
 */
export function parseMCPResponse<T = unknown>(response: unknown): T {
  if (!response || typeof response !== "object") {
    throw new MCPResponseError("Invalid MCP response: expected an object", { isError: true });
  }

  const mcpResp = response as MCPCallToolResponse;

  // 1. Check isError flag FIRST
  if (mcpResp.isError === true) {
    const errorText =
      Array.isArray(mcpResp.content) && mcpResp.content.length > 0 && typeof (mcpResp.content[0] as MCPContentText).text === "string"
        ? (mcpResp.content[0] as MCPContentText).text
        : "MCP tool execution returned isError: true with no descriptive text";

    throw new MCPResponseError(`MCP tool error: ${errorText}`, mcpResp, errorText);
  }

  // 2. Validate content array
  if (!Array.isArray(mcpResp.content) || mcpResp.content.length === 0) {
    throw new MCPResponseError("Invalid MCP response: content array is missing or empty", mcpResp);
  }

  const firstItem = mcpResp.content[0];
  if (!firstItem || typeof (firstItem as MCPContentText).text !== "string") {
    throw new MCPResponseError(
      `Invalid MCP response: content[0].text is not a string (type: ${(firstItem as MCPContentItem)?.type})`,
      mcpResp
    );
  }

  const rawText = (firstItem as MCPContentText).text;

  // 3. Parse content[0].text as JSON
  try {
    return JSON.parse(rawText) as T;
  } catch (err: unknown) {
    const parseErrorMsg = err instanceof Error ? err.message : String(err);
    throw new MCPResponseError(
      `Failed to parse MCP response content[0].text as JSON: ${parseErrorMsg}`,
      mcpResp,
      rawText
    );
  }
}

/**
 * wrapMCPToolCall:
 * Helper to wrap any tool invoker (which returns an MCP response object or Promise)
 * in the safe MCP response parser.
 */
export async function wrapMCPToolCall<T = unknown>(
  invoker: () => Promise<MCPCallToolResponse> | MCPCallToolResponse
): Promise<T> {
  const rawResponse = await invoker();
  return parseMCPResponse<T>(rawResponse);
}

/**
 * wrapMCPToolCallSync:
 * Synchronous variant for local in-process tool handlers that format CallToolResult directly.
 */
export function wrapMCPToolCallSync<T = unknown>(
  invoker: () => MCPCallToolResponse
): T {
  const rawResponse = invoker();
  return parseMCPResponse<T>(rawResponse);
}
