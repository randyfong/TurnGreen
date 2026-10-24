import { YouthResolutionDocument } from "../types.js";
/**
 * Generates print-ready HTML with responsive and print CSS rules ensuring exact 1-page fit
 * upon browser printing or PDF conversion (8.5in x 11in).
 */
export declare function renderSinglePageHtml(doc: Omit<YouthResolutionDocument, "single_page_html" | "resolution_markdown">): string;
/**
 * Formats clean, rich GitHub Flavored Markdown for in-game dialog display.
 */
export declare function renderResolutionMarkdown(doc: Omit<YouthResolutionDocument, "single_page_html" | "resolution_markdown">): string;
