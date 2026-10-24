import { ScienceTopicExplanation } from "../types.js";
export interface FormattedDrawerResponse {
    topic_id: string;
    category: string;
    title: string;
    headline: string;
    audience_selected: string;
    drawer_header: {
        title: string;
        badge: string;
        summary: string;
    };
    drawer_body_markdown: string;
    scientific_equations?: string[];
    key_coefficients?: Record<string, string | number>;
    un_sdg_framework: {
        indicator_code: string;
        target_summary: string;
        sub_indicators: Array<{
            name: string;
            rule: string;
            game_connection: string;
        }>;
    };
    citations: Array<{
        title: string;
        authors: string[];
        year: number;
        source: string;
        link: string;
    }>;
}
export declare function formatDrawerMarkdown(topic: ScienceTopicExplanation, audience: "youth" | "technical" | "all"): FormattedDrawerResponse;
