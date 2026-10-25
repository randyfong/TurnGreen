import { executeGenerateYouthResolution } from "../MCP/resolution_generator/src/index.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSampleResolutionHtml(): string {
  const turns = [
    {
      turn: 1,
      intervention_id: "urban_canopy_trees" as const,
      intervention_name: "Street Tree Canopy Expansion",
      budget_allocated: 40000,
      area_converted_ha: 2.67,
      surface_temp_drop_celsius: 0.15,
      runoff_retained_m3: 3100
    },
    {
      turn: 2,
      intervention_id: "permeable_pavement" as const,
      intervention_name: "Permeable Pavement & De-paved Plazas",
      budget_allocated: 35000,
      area_converted_ha: 2.19,
      surface_temp_drop_celsius: 0.08,
      runoff_retained_m3: 4200
    },
    {
      turn: 3,
      intervention_id: "cool_roofs" as const,
      intervention_name: "Reflective Cool Roofs",
      budget_allocated: 45000,
      area_converted_ha: 5.0,
      surface_temp_drop_celsius: 0.35,
      runoff_retained_m3: 4200
    },
    {
      turn: 4,
      intervention_id: "bioswales" as const,
      intervention_name: "Bioswales & Infiltration Basins",
      budget_allocated: 30000,
      area_converted_ha: 2.31,
      surface_temp_drop_celsius: 0.12,
      runoff_retained_m3: 4850
    },
    {
      turn: 5,
      intervention_id: "pocket_parks" as const,
      intervention_name: "Pocket Parks & Soil De-paving",
      budget_allocated: 50000,
      area_converted_ha: 2.63,
      surface_temp_drop_celsius: 0.18,
      runoff_retained_m3: 4850
    }
  ];

  const resolutionResult = executeGenerateYouthResolution({
    author_name: "Maya Lin",
    district_name: "District 6 - Central Urban Basin",
    organization_or_school: "Lincoln High Youth Environmental Action",
    target_body: "City Council",
    session_history: {
      session_id: "pdf-export-verification-session",
      turns,
      learning_gain: {
        normalized_gain: 0.833,
        gain_category: "High Gain",
        summary: "Participant demonstrated an 83% normalized learning gain."
      }
    }
  });

  const htmlPath = path.join(__dirname, "resolution_sample.html");
  fs.writeFileSync(htmlPath, resolutionResult.single_page_html, "utf8");
  console.log(`✓ Saved resolution HTML to ${htmlPath}`);

  return htmlPath;
}

const htmlFile = generateSampleResolutionHtml();

// Print to PDF using Headless Chrome
const pdfPath = path.join(__dirname, "resolution_sample.pdf");
try {
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const cmd = `"${chromePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "file://${htmlFile}"`;
  console.log(`Executing headless chrome PDF render:\n${cmd}`);
  execSync(cmd, { stdio: "inherit" });
  console.log(`✓ PDF successfully generated at: ${pdfPath}`);
} catch (err: any) {
  console.error("Headless Chrome PDF export failed:", err.message);
}
