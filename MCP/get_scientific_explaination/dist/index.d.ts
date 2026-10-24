import { FormattedDrawerResponse } from "./services/drawer_service.js";
export declare function resolveTopic(topicIdRaw: string): {
    title: string;
    id: string;
    category: "sdg_indicators" | "biophysical_models" | "land_cover_standards" | "policy_interventions";
    headline: string;
    youth_summary: string;
    scientific_details: {
        biophysical_mechanism: string;
        baseline_assumptions: string[];
        core_equations?: string[] | undefined;
        key_coefficients?: Record<string, string | number> | undefined;
    };
    citations: {
        title: string;
        authors: string[];
        year: number;
        publisher_or_journal: string;
        doi_or_url: string;
        citation_type: "peer_reviewed_paper" | "un_standard" | "model_specification" | "dataset";
    }[];
    drawer_markdown: string;
    un_sdg_connection?: {
        target_code: string;
        direct_applicability: string;
        trends_earth_verification: string;
    } | undefined;
};
export declare function executeGetScienceExplanation(inputRaw: unknown): FormattedDrawerResponse;
export declare function executeListTopics(): {
    sdg_framework: {
        goal: string;
        indicator: string;
        sub_indicators: {
            code: string;
            name: string;
        }[];
    };
    available_topics: {
        id: string;
        category: "sdg_indicators" | "biophysical_models" | "land_cover_standards" | "policy_interventions";
        title: string;
        headline: string;
        citations_count: number;
    }[];
};
