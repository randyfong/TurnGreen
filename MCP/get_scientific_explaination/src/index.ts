import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import { TOPIC_EXPLANATIONS } from "./data/topics.js";
import { SDG_15_3_1_DATA } from "./data/sdg_15_3_1.js";
import { formatDrawerMarkdown, FormattedDrawerResponse } from "./services/drawer_service.js";
import { GetScienceExplanationInputSchema } from "./types.js";

// Alias resolution mapping so users can query by alternate names
const TOPIC_ALIASES: Record<string, string> = {
  // SDG aliases
  sdg_15: "sdg_15_3_1",
  "15.3.1": "sdg_15_3_1",
  sdg15: "sdg_15_3_1",
  land_degradation: "sdg_15_3_1",
  trends_earth: "sdg_15_3_1",
  ldn: "sdg_15_3_1",

  // InVEST Cooling aliases
  invest_cooling: "invest_urban_cooling",
  cooling_model: "invest_urban_cooling",
  heat_mitigation_index: "invest_urban_cooling",
  hmi: "invest_urban_cooling",
  evapotranspiration: "invest_urban_cooling",
  albedo: "invest_urban_cooling",
  temperature: "invest_urban_cooling",

  // InVEST Flood aliases
  invest_flood: "invest_flood_risk",
  flood_model: "invest_flood_risk",
  curve_number: "invest_flood_risk",
  scs_cn: "invest_flood_risk",
  stormwater: "invest_flood_risk",
  runoff: "invest_flood_risk",

  // ESA WorldCover aliases
  esa: "esa_worldcover",
  worldcover: "esa_worldcover",
  land_cover: "esa_worldcover",
  built_up: "esa_worldcover",

  // Policy interventions
  trees: "urban_canopy_trees",
  canopy: "urban_canopy_trees",
  permeable: "permeable_pavement",
  depaving: "permeable_pavement",
  bioswale: "bioswales",
  rain_gardens: "bioswales",
  green_roof: "green_roofs",
  cool_roof: "cool_roofs",
  parks: "pocket_parks"
};

const GET_SCIENCE_EXPLANATION_TOOL: Tool = {
  name: "get_science_explanation",
  description:
    "Retrieves authoritative scientific explanations, biophysical formulas, InVEST model parameters, and UN SDG Indicator 15.3.1 (UNCCD Trends.Earth) citations for in-game metric tooltips and the 'Science Behind This' slide-out drawer.",
  inputSchema: {
    type: "object",
    properties: {
      topic_id: {
        type: "string",
        description:
          "Topic or policy identifier (e.g., 'sdg_15_3_1', 'invest_urban_cooling', 'invest_flood_risk', 'esa_worldcover', 'urban_canopy_trees', 'permeable_pavement', 'bioswales', 'green_roofs', 'cool_roofs', 'pocket_parks')."
      },
      audience: {
        type: "string",
        enum: ["youth", "technical", "all"],
        default: "all",
        description:
          "Level of detail: 'youth' (accessible 15-24 language), 'technical' (equations, coefficients, parameters), or 'all' (complete multi-section drawer payload)."
      }
    },
    required: ["topic_id"]
  }
};

const LIST_SCIENCE_TOPICS_TOOL: Tool = {
  name: "list_science_topics",
  description: "Lists all available scientific topics, models, and policy evidence items in the TurnGreen registry.",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export function resolveTopic(topicIdRaw: string) {
  const normalized = topicIdRaw.toLowerCase().trim().replace(/[\s-]/g, "_");
  const resolvedId = TOPIC_ALIASES[normalized] ?? normalized;
  return TOPIC_EXPLANATIONS[resolvedId];
}

export function executeGetScienceExplanation(inputRaw: unknown): FormattedDrawerResponse {
  const parsed = GetScienceExplanationInputSchema.parse(inputRaw);
  const topic = resolveTopic(parsed.topic_id);

  if (!topic) {
    const validTopics = Object.keys(TOPIC_EXPLANATIONS).join(", ");
    throw new Error(
      `Unknown topic_id '${parsed.topic_id}'. Valid topics: [${validTopics}]. You may also use aliases like 'sdg_15', 'cooling_model', 'scs_cn', 'trees', 'depaving', etc.`
    );
  }

  return formatDrawerMarkdown(topic, parsed.audience);
}

export function executeListTopics() {
  return {
    sdg_framework: {
      goal: SDG_15_3_1_DATA.goal,
      indicator: SDG_15_3_1_DATA.indicator,
      sub_indicators: SDG_15_3_1_DATA.sub_indicators.map((s) => ({
        code: s.code,
        name: s.name
      }))
    },
    available_topics: Object.values(TOPIC_EXPLANATIONS).map((t) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      headline: t.headline,
      citations_count: t.citations.length
    }))
  };
}

async function startServer() {
  const server = new Server(
    {
      name: "turngreen-science-explanation-server",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [GET_SCIENCE_EXPLANATION_TOOL, LIST_SCIENCE_TOPICS_TOOL]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "get_science_explanation") {
      try {
        const result = executeGetScienceExplanation(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `get_science_explanation error: ${message}`
            }
          ]
        };
      }
    }

    if (name === "list_science_topics") {
      try {
        const result = executeListTopics();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `list_science_topics error: ${message}`
            }
          ]
        };
      }
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Unknown tool name: ${name}`
        }
      ]
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("get_science_explanation MCP Server running on stdio");
}

// Start stdio server if directly invoked
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  startServer().catch((err) => {
    console.error("Fatal server error:", err);
    process.exit(1);
  });
}
