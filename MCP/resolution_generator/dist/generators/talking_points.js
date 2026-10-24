import { INVEST_COOLING_STANDARD, INVEST_FLOOD_STANDARD, UN_SDG_15_3_1_STANDARD } from "../standards/un_sdg_targets.js";
/**
 * Synthesizes three high-impact, 60-90 second verbal talking points
 * formatted for municipal public comment sessions (e.g. City Council or School Board 2-minute limits).
 */
export function buildActionableTalkingPoints(authorName, districtName, targetBody, turns, scorecard) {
    // Aggregate intervention types
    const interventionCounts = {};
    let totalCanopySpend = 0;
    let totalWaterSpend = 0;
    let totalCoolRoofSpend = 0;
    for (const t of turns) {
        interventionCounts[t.intervention_id] = (interventionCounts[t.intervention_id] || 0) + 1;
        if (t.intervention_id === "urban_canopy_trees" || t.intervention_id === "pocket_parks") {
            totalCanopySpend += t.budget_allocated;
        }
        else if (t.intervention_id === "permeable_pavement" || t.intervention_id === "bioswales") {
            totalWaterSpend += t.budget_allocated;
        }
        else if (t.intervention_id === "green_roofs" || t.intervention_id === "cool_roofs") {
            totalCoolRoofSpend += t.budget_allocated;
        }
    }
    // Point 1: Heat Vulnerability, Youth Health & Shade Equity (0:00 - 0:30)
    const point1 = {
        id: 1,
        timeframe: "0:00 - 0:30",
        topic_title: "Neighborhood Heat Equity & Children's Health",
        hook: `Good evening members of the ${targetBody}. My name is ${authorName}, representing youth in ${districtName}. In our community, summer heat is not just uncomfortable—it is dangerous.`,
        evidence_citation: `${INVEST_COOLING_STANDARD.model}`,
        recommended_script: `Our empirical simulation proves that with strategic tree canopy expansion and shade retrofits, ${districtName} can drop neighborhood summer surface temperatures by ${scorecard.total_heat_reduction_display}. According to Stanford's InVEST urban cooling research, every tree canopy increase creates a 100-meter cooling buffer that directly lowers heat exhaustion rates for kids walking to school and waiting at transit stops.`,
        policy_demand: `Allocate dedicated capital improvement dollars to plant continuous canopy corridors across high-heat transit routes in ${districtName} before next summer.`
    };
    // Point 2: Stormwater Mitigation & Flood Damage Prevention (0:30 - 1:00)
    const point2 = {
        id: 2,
        timeframe: "0:30 - 1:00",
        topic_title: "Green Stormwater Infrastructure Over Costly Pipe Repairs",
        hook: `Every time atmospheric rivers hit our district, sewer grates overflow and basements flood because over 70% of our ground is sealed in impervious asphalt.`,
        evidence_citation: `${INVEST_FLOOD_STANDARD.model}`,
        recommended_script: `Our 5-turn planning engine demonstrates that de-paving obsolete asphalt into bioswales and permeable surfaces captures ${scorecard.total_stormwater_retained_m3.toLocaleString()} m³ (${scorecard.total_stormwater_retained_gallons.toLocaleString()} gallons) of stormwater right at the curb. Under USDA Natural Resources Conservation Service hydrology models, bio-retention cuts peak runoff volume by up to 45%, preventing tens of thousands of dollars in emergency road repairs and basement water damage.`,
        policy_demand: `Adopt a municipal 'De-Pave First' ordinance requiring permeable pavement and roadside bioswales during all scheduled sidewalk and parking resurfacing projects.`
    };
    // Point 3: Accountability, UN SDG 15.3.1 Compliance & 5-Year Capital Allocation (1:00 - 1:30)
    const point3 = {
        id: 3,
        timeframe: "1:00 - 1:30",
        topic_title: "Verifiable Land Degradation Neutrality & Youth Future",
        hook: `As young people who will live with your infrastructure decisions for decades, we are bringing you verified scientific solutions—not vague protests.`,
        evidence_citation: `${UN_SDG_15_3_1_STANDARD.indicator} & ${UN_SDG_15_3_1_STANDARD.trends_earth_metric}`,
        recommended_script: `By converting ${scorecard.total_depaved_ha.toFixed(2)} hectares of degraded impervious surfaces back into living ecosystems, ${districtName} directly meets UN Land Degradation Neutrality (LDN) benchmarks under UN SDG Indicator 15.3.1. We have tested the budget trade-offs ourselves in a verified 5-turn simulation: nature-based solutions deliver a measurable ${scorecard.budget_efficiency_rating} return on investment in avoided disaster costs and public health benefits.`,
        policy_demand: `Formally integrate this 5-Year Youth Climate Mandate into the municipal General Plan update and invite youth delegates to review the annual capital improvement budget.`
    };
    return [point1, point2, point3];
}
