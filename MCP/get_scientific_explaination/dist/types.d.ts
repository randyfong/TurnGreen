import { z } from "zod";
export declare const CitationSchema: z.ZodObject<{
    title: z.ZodString;
    authors: z.ZodArray<z.ZodString, "many">;
    year: z.ZodNumber;
    publisher_or_journal: z.ZodString;
    doi_or_url: z.ZodString;
    citation_type: z.ZodEnum<["peer_reviewed_paper", "un_standard", "model_specification", "dataset"]>;
}, "strip", z.ZodTypeAny, {
    title: string;
    authors: string[];
    year: number;
    publisher_or_journal: string;
    doi_or_url: string;
    citation_type: "peer_reviewed_paper" | "un_standard" | "model_specification" | "dataset";
}, {
    title: string;
    authors: string[];
    year: number;
    publisher_or_journal: string;
    doi_or_url: string;
    citation_type: "peer_reviewed_paper" | "un_standard" | "model_specification" | "dataset";
}>;
export type Citation = z.infer<typeof CitationSchema>;
export declare const SubIndicatorSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    trends_earth_rule: z.ZodString;
    game_connection: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    description: string;
    trends_earth_rule: string;
    game_connection: string;
}, {
    code: string;
    name: string;
    description: string;
    trends_earth_rule: string;
    game_connection: string;
}>;
export type SubIndicator = z.infer<typeof SubIndicatorSchema>;
export declare const SDGAlignmentSchema: z.ZodObject<{
    goal: z.ZodString;
    target: z.ZodString;
    indicator: z.ZodString;
    custodian_agency: z.ZodString;
    indicator_description: z.ZodString;
    sub_indicators: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        trends_earth_rule: z.ZodString;
        game_connection: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        name: string;
        description: string;
        trends_earth_rule: string;
        game_connection: string;
    }, {
        code: string;
        name: string;
        description: string;
        trends_earth_rule: string;
        game_connection: string;
    }>, "many">;
    methodological_source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    goal: string;
    target: string;
    indicator: string;
    custodian_agency: string;
    indicator_description: string;
    sub_indicators: {
        code: string;
        name: string;
        description: string;
        trends_earth_rule: string;
        game_connection: string;
    }[];
    methodological_source: string;
}, {
    goal: string;
    target: string;
    indicator: string;
    custodian_agency: string;
    indicator_description: string;
    sub_indicators: {
        code: string;
        name: string;
        description: string;
        trends_earth_rule: string;
        game_connection: string;
    }[];
    methodological_source: string;
}>;
export type SDGAlignment = z.infer<typeof SDGAlignmentSchema>;
export declare const TopicCategorySchema: z.ZodEnum<["sdg_indicators", "biophysical_models", "land_cover_standards", "policy_interventions"]>;
export type TopicCategory = z.infer<typeof TopicCategorySchema>;
export declare const ScienceTopicExplanationSchema: z.ZodObject<{
    id: z.ZodString;
    category: z.ZodEnum<["sdg_indicators", "biophysical_models", "land_cover_standards", "policy_interventions"]>;
    title: z.ZodString;
    headline: z.ZodString;
    youth_summary: z.ZodString;
    scientific_details: z.ZodObject<{
        core_equations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        key_coefficients: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
        biophysical_mechanism: z.ZodString;
        baseline_assumptions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        biophysical_mechanism: string;
        baseline_assumptions: string[];
        core_equations?: string[] | undefined;
        key_coefficients?: Record<string, string | number> | undefined;
    }, {
        biophysical_mechanism: string;
        baseline_assumptions: string[];
        core_equations?: string[] | undefined;
        key_coefficients?: Record<string, string | number> | undefined;
    }>;
    un_sdg_connection: z.ZodOptional<z.ZodObject<{
        target_code: z.ZodString;
        direct_applicability: z.ZodString;
        trends_earth_verification: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target_code: string;
        direct_applicability: string;
        trends_earth_verification: string;
    }, {
        target_code: string;
        direct_applicability: string;
        trends_earth_verification: string;
    }>>;
    citations: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        authors: z.ZodArray<z.ZodString, "many">;
        year: z.ZodNumber;
        publisher_or_journal: z.ZodString;
        doi_or_url: z.ZodString;
        citation_type: z.ZodEnum<["peer_reviewed_paper", "un_standard", "model_specification", "dataset"]>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        authors: string[];
        year: number;
        publisher_or_journal: string;
        doi_or_url: string;
        citation_type: "peer_reviewed_paper" | "un_standard" | "model_specification" | "dataset";
    }, {
        title: string;
        authors: string[];
        year: number;
        publisher_or_journal: string;
        doi_or_url: string;
        citation_type: "peer_reviewed_paper" | "un_standard" | "model_specification" | "dataset";
    }>, "many">;
    drawer_markdown: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export type ScienceTopicExplanation = z.infer<typeof ScienceTopicExplanationSchema>;
export declare const GetScienceExplanationInputSchema: z.ZodObject<{
    topic_id: z.ZodString;
    audience: z.ZodDefault<z.ZodEnum<["youth", "technical", "all"]>>;
}, "strip", z.ZodTypeAny, {
    topic_id: string;
    audience: "youth" | "technical" | "all";
}, {
    topic_id: string;
    audience?: "youth" | "technical" | "all" | undefined;
}>;
export type GetScienceExplanationInput = z.infer<typeof GetScienceExplanationInputSchema>;
