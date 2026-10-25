/**
 * Generates print-ready HTML with responsive and print CSS rules ensuring exact 1-page fit
 * upon browser printing or PDF conversion (8.5in x 11in).
 */
export function renderSinglePageHtml(doc) {
    const talkingPointsHtml = doc.talking_points
        .map((tp) => `
    <div class="talking-point-card">
      <div class="tp-header">
        <span class="tp-badge">${tp.timeframe}</span>
        <h4 class="tp-title">${tp.id}. ${escapeHtml(tp.topic_title)}</h4>
      </div>
      <p class="tp-script"><strong>Speaking Note:</strong> "${escapeHtml(tp.recommended_script)}"</p>
      <div class="tp-meta">
        <span class="tp-citation"><strong>Scientific Basis:</strong> ${escapeHtml(tp.evidence_citation)}</span>
        <span class="tp-demand"><strong>Mandate Demand:</strong> ${escapeHtml(tp.policy_demand)}</span>
      </div>
    </div>`)
        .join("");
    const whereasHtml = doc.whereas_clauses
        .map((w) => `<li><span class="clause-prefix">WHEREAS,</span> ${escapeHtml(w)}</li>`)
        .join("");
    const resolvedHtml = doc.resolved_clauses
        .map((r) => `<li><span class="clause-prefix">NOW, THEREFORE, BE IT RESOLVED,</span> ${escapeHtml(r)}</li>`)
        .join("");
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(doc.title)}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.38in 0.45in 0.35in 0.45in;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a202c;
      background-color: #ffffff;
      font-size: 8.5pt;
      line-height: 1.28;
    }
    .page-container {
      width: 100%;
      max-width: 8.0in;
      margin: 0 auto;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2d3748;
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .title-block h1 {
      font-size: 13pt;
      font-weight: 800;
      color: #1a4731;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .title-block h2 {
      font-size: 9pt;
      font-weight: 600;
      color: #4a5568;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 7.5pt;
      color: #4a5568;
    }
    .meta-box strong {
      color: #1a202c;
    }
    .scorecard-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 7px;
    }
    .score-card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px 6px;
      text-align: center;
    }
    .score-card .val {
      font-size: 11pt;
      font-weight: 800;
      color: #22543d;
      display: block;
    }
    .score-card .lbl {
      font-size: 6.8pt;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .section-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #1a202c;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e0;
      padding-bottom: 1px;
      margin-bottom: 4px;
      margin-top: 4px;
      letter-spacing: 0.4px;
    }
    .clauses-list {
      list-style-type: none;
      margin-bottom: 5px;
    }
    .clauses-list li {
      margin-bottom: 3.5px;
      font-size: 8pt;
      text-align: justify;
    }
    .clause-prefix {
      font-weight: 800;
      color: #2b6cb0;
      font-style: italic;
    }
    .talking-points-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 6px;
    }
    .talking-point-card {
      background: #f0fff4;
      border-left: 3px solid #38a169;
      border-radius: 2px;
      padding: 3px 6px;
    }
    .tp-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }
    .tp-badge {
      background: #276749;
      color: #ffffff;
      font-size: 6.5pt;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 2px;
    }
    .tp-title {
      font-size: 8pt;
      font-weight: 700;
      color: #22543d;
    }
    .tp-script {
      font-size: 7.5pt;
      color: #2d3748;
      font-style: italic;
      line-height: 1.25;
    }
    .tp-meta {
      display: flex;
      justify-content: space-between;
      font-size: 6.5pt;
      color: #718096;
      margin-top: 2px;
      border-top: 1px dashed #cbd5e0;
      padding-top: 1px;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 3px;
      font-size: 6.5pt;
      color: #a0aec0;
      margin-top: 4px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header-banner">
      <div class="title-block">
        <h1>Simulated Youth Policy Mandate (Educational Scenario)</h1>
        <h2>Policy Resolution ${escapeHtml(doc.resolution_number)} &bull; ${escapeHtml(doc.district_name)}</h2>
      </div>
      <div class="meta-box">
        <div><strong>Author:</strong> ${escapeHtml(doc.author_name)}</div>
        <div><strong>Delegation:</strong> ${escapeHtml(doc.organization_or_school)}</div>
        <div><strong>Submitted To:</strong> ${escapeHtml(doc.target_body)}</div>
        <div><strong>Date:</strong> ${escapeHtml(doc.date_formatted)}</div>
      </div>
    </div>

    <!-- Biophysical Scorecard Strip -->
    <div class="scorecard-strip">
      <div class="score-card">
        <span class="val">${escapeHtml(doc.biophysical_scorecard.total_heat_reduction_display)}</span>
        <span class="lbl">Heatwave Cooling (InVEST)</span>
      </div>
      <div class="score-card">
        <span class="val">${escapeHtml(doc.biophysical_scorecard.total_stormwater_retained_m3.toLocaleString())} m³</span>
        <span class="lbl">Total Modeled Retention (50-mm Design Storm)</span>
      </div>
      <div class="score-card">
        <span class="val">${escapeHtml(doc.biophysical_scorecard.ground_depaved_ha.toFixed(2))} ha</span>
        <span class="lbl">Net Ground De-Paved (${escapeHtml((doc.biophysical_scorecard.total_ground_interventions_ha ?? doc.biophysical_scorecard.ground_depaved_ha).toFixed(2))} ha Total Ground Interventions)</span>
      </div>
      <div class="score-card">
        <span class="val">SDG 15.3.1</span>
        <span class="lbl">${escapeHtml(doc.biophysical_scorecard.un_sdg_15_3_1_avoided_degradation_score)}</span>
      </div>
    </div>

    <!-- Legal Resolution Clauses -->
    <div class="section-title">Formal Policy Clauses</div>
    <ul class="clauses-list">
      ${whereasHtml}
      ${resolvedHtml}
    </ul>

    <!-- 3 Actionable Public Comment Talking Points -->
    <div class="section-title">Actionable Public Comment Briefing (3 Key Mandates)</div>
    <div class="talking-points-grid">
      ${talkingPointsHtml}
    </div>

    <div class="footer-bar">
      <span>TurnGreen Civic Simulation Engine &bull; Modeling Framework: Stanford InVEST &bull; ESA WorldCover 10m &bull; USDA-SCS NEH-4</span>
      <span>Simulated Youth Policy Mandate (Educational Scenario)</span>
    </div>
    <div style="font-size: 6pt; color: #718096; margin-top: 3px; font-style: italic; line-height: 1.2;">
      Educational Simulation Notice: Metric outputs are simulation estimates generated for civic learning using simplified biophysical formulas (InVEST urban cooling, USDA-SCS hydrology, and UNCCD SDG 15.3.1 definitions). Independent scientific accuracy, site-specific 100m cooling radii, numeric financial ROI, and regulatory compliance are not established by this tool.
    </div>
  </div>
</body>
</html>`;
}
/**
 * Formats clean, rich GitHub Flavored Markdown for in-game dialog display.
 */
export function renderResolutionMarkdown(doc) {
    const whereasMd = doc.whereas_clauses.map((w) => `* **WHEREAS,** ${w}`).join("\n");
    const resolvedMd = doc.resolved_clauses.map((r) => `* **NOW, THEREFORE, BE IT RESOLVED,** ${r}`).join("\n");
    const tpMd = doc.talking_points
        .map((tp) => `
### Point ${tp.id}: ${tp.topic_title} (${tp.timeframe})
> **Verbal Hook:** "${tp.hook}"
>
> **Evidence-Based Statement:** "${tp.recommended_script}"
>
> **Specific Policy Demand:** **${tp.policy_demand}**
>
> *Scientific Model:* \`${tp.evidence_citation}\`
`)
        .join("\n");
    const totalGroundInterventions = doc.biophysical_scorecard.total_ground_interventions_ha ?? doc.biophysical_scorecard.ground_depaved_ha;
    const bareSoilRestored = doc.biophysical_scorecard.bare_soil_vegetated_ha ?? 0;
    const groundInterventionsRow = totalGroundInterventions > doc.biophysical_scorecard.ground_depaved_ha
        ? `| **Total Ground Ecological Interventions** | **${totalGroundInterventions.toFixed(2)} hectares** (including ${bareSoilRestored.toFixed(2)} ha bare-soil restoration & permeable retrofits) | Gross Intervention Footprint |\n`
        : "";
    return `# YOUTH CLIMATE RESILIENCE MANDATE (SIMULATED SCENARIO)
**Resolution Number:** ${doc.resolution_number}  
**Target Body:** ${doc.target_body}  
**District:** ${doc.district_name}  
**Author:** ${doc.author_name} (${doc.organization_or_school})  
**Date:** ${doc.date_formatted}  

---

## Executive Summary
${doc.executive_summary}

## Biophysical Impact Scorecard
| Metric | Value | Simulation Modeling Framework |
| :--- | :--- | :--- |
| **Heatwave Surface Cooling** | **${doc.biophysical_scorecard.total_heat_reduction_display}** | Stanford InVEST Urban Cooling Model |
| **Total Modeled Stormwater Retention** | **${doc.biophysical_scorecard.total_stormwater_retained_m3.toLocaleString()} m³ / 50-mm storm** (${doc.biophysical_scorecard.total_stormwater_retained_gallons.toLocaleString()} gal; ${(doc.biophysical_scorecard.baseline_runoff_reduction_m3 ?? 8565).toLocaleString()} m³ runoff reduction) | USDA-SCS Curve Number Hydrology |
| **Net Ground De-Paved (Asphalt Removed)** | **${doc.biophysical_scorecard.ground_depaved_ha.toFixed(2)} hectares** | ESA WorldCover 10m (Class 50 &rarr; 10/20) |
${groundInterventionsRow}| **Rooftop Retrofits** | **${doc.biophysical_scorecard.rooftop_treated_ha.toFixed(2)} hectares** | High-Albedo & Vegetative Roofs |
| **SDG 15.3.1 Alignment** | **Modeled Avoided Degradation** | UNCCD Trends.Earth Framework |
| **Budget Efficiency** | **${doc.biophysical_scorecard.budget_efficiency_rating}** | Municipal Cost-Avoidance Analysis |

---

## Formal Resolution
${whereasMd}

${resolvedMd}

---

## 3 Actionable Public Comment Talking Points (City Council / School Board)
${tpMd}

---
*Educational Simulation Notice: Metric outputs are simulation estimates generated for civic learning using simplified biophysical formulas (InVEST urban cooling, USDA-SCS hydrology, and UNCCD SDG 15.3.1 definitions). Independent scientific accuracy, site-specific 100m cooling radii, numeric financial ROI, and regulatory compliance are not established by this tool.*
`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
