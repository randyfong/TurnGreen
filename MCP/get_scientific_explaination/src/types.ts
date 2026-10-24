import { z } from "zod";

export const CitationSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number(),
  publisher_or_journal: z.string(),
  doi_or_url: z.string(),
  citation_type: z.enum(["peer_reviewed_paper", "un_standard", "model_specification", "dataset"])
});
export type Citation = z.infer<typeof CitationSchema>;

export const SubIndicatorSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  trends_earth_rule: z.string(),
  game_connection: z.string()
});
export type SubIndicator = z.infer<typeof SubIndicatorSchema>;

export const SDGAlignmentSchema = z.object({
  goal: z.string(),
  target: z.string(),
  indicator: z.string(),
  custodian_agency: z.string(),
  indicator_description: z.string(),
  sub_indicators: z.array(SubIndicatorSchema),
  methodological_source: z.string()
});
export type SDGAlignment = z.infer<typeof SDGAlignmentSchema>;

export const TopicCategorySchema = z.enum([
  "sdg_indicators",
  "biophysical_models",
  "land_cover_standards",
  "policy_interventions"
]);
export type TopicCategory = z.infer<typeof TopicCategorySchema>;

export const ScienceTopicExplanationSchema = z.object({
  id: z.string(),
  category: TopicCategorySchema,
  title: z.string(),
  headline: z.string(),
  youth_summary: z.string(),
  scientific_details: z.object({
    core_equations: z.array(z.string()).optional(),
    key_coefficients: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
    biophysical_mechanism: z.string(),
    baseline_assumptions: z.array(z.string())
  }),
  un_sdg_connection: z.object({
    target_code: z.string(),
    direct_applicability: z.string(),
    trends_earth_verification: z.string()
  }).optional(),
  citations: z.array(CitationSchema),
  drawer_markdown: z.string()
});
export type ScienceTopicExplanation = z.infer<typeof ScienceTopicExplanationSchema>;

export const GetScienceExplanationInputSchema = z.object({
  topic_id: z.string().describe(
    "Identifier for the scientific topic, model, or policy (e.g., 'sdg_15_3_1', 'invest_urban_cooling', 'invest_flood_risk', 'esa_worldcover', 'urban_canopy_trees', 'permeable_pavement', 'bioswales', 'green_roofs', 'cool_roofs', 'pocket_parks')"
  ),
  audience: z.enum(["youth", "technical", "all"]).default("all").describe(
    "Target reading level for returned text: 'youth' (simplified), 'technical' (formulas/citations), or 'all' (complete)"
  )
});
export type GetScienceExplanationInput = z.infer<typeof GetScienceExplanationInputSchema>;
