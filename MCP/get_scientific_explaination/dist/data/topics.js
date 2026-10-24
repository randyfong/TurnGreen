import { CITATIONS } from "./citations.js";
export const TOPIC_EXPLANATIONS = {
    // 1. SDG 15.3.1 / UNCCD Land Degradation Neutrality
    sdg_15_3_1: {
        id: "sdg_15_3_1",
        category: "sdg_indicators",
        title: "UN SDG 15.3.1: Land Degradation Neutrality & Urban Soils",
        headline: "How De-paving and Urban Greening Count Toward Global Land Restoration Targets",
        youth_summary: "When we pave over dirt with black asphalt, the ground can't breathe, absorb rain, or grow plants—the UN officially calls this 'land degradation'. When you plant trees or de-pave plazas in TurnGreen, you are restoring living soil and helping your neighborhood meet the UN Sustainable Development Goal 15.3.",
        scientific_details: {
            core_equations: [
                "Land Degradation Indicator 15.3.1 = (Area Degraded / Total Land Area) * 100",
                "1OAO (One Out, All Out) Rule: If Land Cover, Productivity, OR Soil Carbon degrades, the parcel is degraded."
            ],
            key_coefficients: {
                "Sub-Indicator 1": "Land Cover Transitions (ESA WorldCover classes)",
                "Sub-Indicator 2": "Land Productivity Dynamics (Vegetative vigor / NDVI trajectory)",
                "Sub-Indicator 3": "Soil Organic Carbon (SOC mg C / ha in upper 30cm)"
            },
            biophysical_mechanism: "Urban land sealing (soil asphyxiation under asphalt/concrete) is recognized by UNCCD Trends.Earth as artificial land degradation. Converting Class 50 (Built-up) to vegetative classes reverses degradation trajectories under the international 1OAO protocol.",
            baseline_assumptions: [
                "Pre-intervention asphalt surfaces exhibit 0% biomass productivity and negligible soil gas exchange.",
                "De-paving and bioretention restore infiltration and soil microbial respiration.",
                "Local municipal actions directly aggregate into national voluntary Land Degradation Neutrality (LDN) targets."
            ]
        },
        un_sdg_connection: {
            target_code: "UN SDG Target 15.3 / Indicator 15.3.1",
            direct_applicability: "Tracks avoided artificial land degradation by converting built-up impervious space into functional vegetative cover and sponge capacity.",
            trends_earth_verification: "Trends.Earth Land Cover Transition Matrix categorizes transitions from Artificial (Class 50) to Tree Canopy (Class 10) or Grass/Shrubland (Class 20/30) as positive land improvement."
        },
        citations: [CITATIONS.un_sdg_15_3_1_metadata, CITATIONS.unccd_trends_earth],
        drawer_markdown: `### UN SDG 15.3.1 & Land Degradation Neutrality

> **Key Takeaway:** Asphalt and concrete "seal" the ground, causing official land degradation. Green interventions reverse this under UNCCD international standards.

#### How It Works Under UNCCD Trends.Earth:
1. **Land Cover Shifts:** Transitioning impermeable built-up space into tree canopy directly upgrades the ecosystem status under the ESA WorldCover mapping standard.
2. **Productivity Trajectory (LPD):** Street trees and vegetated areas introduce net primary photosynthesis, replacing static heat-absorbing stone with living, carbon-capturing biomass.
3. **Soil Carbon Restoration (SOC):** Breaking up sealed concrete restores the soil's ability to act as an organic carbon sponge and stormwater sink.

*Source: UN Statistics Division (UNSD) SDG Global Database & UNCCD Trends.Earth Registry.*`
    },
    // 2. Stanford InVEST Urban Cooling Model
    invest_urban_cooling: {
        id: "invest_urban_cooling",
        category: "biophysical_models",
        title: "Stanford InVEST Urban Cooling Model v3.14",
        headline: "The Physics of Shade, Evapotranspiration, and Urban Heat Mitigation",
        youth_summary: "Concrete and black roofs absorb sunlight and radiate heat like an oven. Trees and plants cool down neighborhoods in two ways: physical shade (blocking the sun) and evapotranspiration (sweating out cool water vapor into the air). InVEST measures this as the Heat Mitigation Index (HMI).",
        scientific_details: {
            core_equations: [
                "HMI = 0.6 * ET_r + 0.2 * Albedo + 0.2 * Shade",
                "T_reduction = HMI * max_cooling_potential (3.5°C)",
                "ET_r = Reference Evapotranspiration Index (0.0 for asphalt, 0.90 for dense forest canopy)",
                "Albedo: Reflectivity of solar radiation (0.12 for dark asphalt, 0.70 for cool reflective roofs)"
            ],
            key_coefficients: {
                "Tree Canopy ET_r": 0.90,
                "Tree Canopy Albedo": 0.20,
                "Tree Canopy Shade": 0.95,
                "Built-up Asphalt ET_r": 0.05,
                "Built-up Asphalt Albedo": 0.12,
                "Built-up Asphalt Shade": 0.00
            },
            biophysical_mechanism: "The Heat Mitigation Index (HMI) combines solar radiation reflectance (albedo), sensible heat obstruction via canopy shade, and latent heat flux via evapotranspirative cooling. The cooling effect decays with distance from the green asset across a 100m decay radius.",
            baseline_assumptions: [
                "Maximum summer temperature reduction ceiling in dense mid-latitude urban environments is calibrated to 3.5°C.",
                "Evapotranspiration values assume adequate summer soil moisture and healthy mature tree root zones."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 11.7 (Sustainable Cities) & SDG 13 (Climate Action)",
            direct_applicability: "Reduces urban heat island intensity in vulnerable, low-canopy urban residential blocks.",
            trends_earth_verification: "Corresponds to vegetative productivity enhancement within the Trends.Earth LPD sub-indicator."
        },
        citations: [CITATIONS.invest_urban_cooling, CITATIONS.santamouris_cool_cities],
        drawer_markdown: `### Stanford InVEST Urban Cooling Model

> **Key Takeaway:** Urban cooling is driven by shade, reflectivity (albedo), and plant "sweating" (evapotranspiration).

#### The Cooling Equation:
$$\\text{HMI} = 0.6 \\cdot \\text{ET}_r + 0.2 \\cdot \\text{Albedo} + 0.2 \\cdot \\text{Shade}$$

- **Tree Canopy:** Delivers massive cooling through high evapotranspiration ($ET_r = 0.90$) and dense leaf shade ($0.95$).
- **Cool & Green Roofs:** Elevate neighborhood albedo from $0.12$ (hot asphalt) up to $0.70$, bouncing incoming solar radiation back into space.

*Source: Natural Capital Project, Stanford University.*`
    },
    // 3. Stanford InVEST Urban Flood Risk Mitigation (USDA SCS-CN)
    invest_flood_risk: {
        id: "invest_flood_risk",
        category: "biophysical_models",
        title: "Stanford InVEST Urban Flood Risk (USDA SCS-CN)",
        headline: "Calculating Stormwater Runoff Reduction and Sponge City Retention",
        youth_summary: "When rain hits asphalt streets, 95% of it surges directly into storm drains, causing sewer backups and flash flooding. When rain hits dirt, parks, or permeable plazas, the ground soaks it up like a sponge. Hydrologists use 'Curve Numbers' to calculate how much water stays out of your basements and streets.",
        scientific_details: {
            core_equations: [
                "S = (25400 / CN) - 254 (Maximum Soil Potential Retention in mm)",
                "Q = (P - 0.2 * S)^2 / (P + 0.8 * S) (Direct Runoff Depth in mm for P > 0.2S)",
                "Volume Retained (m³) = (P - Q) / 1000 * Total Area (m²)",
                "Design Storm (P) = 50.0 mm (standard 2-year 24-hour urban storm event)"
            ],
            key_coefficients: {
                "Impervious Built-up Curve Number (CN)": 98,
                "Tree Canopy / Forest Curve Number (CN)": 60,
                "Grassland / Park Soil Curve Number (CN)": 74,
                "Permeable Pavement Curve Number (CN)": 70,
                "Bioswale / Bioretention Curve Number (CN)": 55
            },
            biophysical_mechanism: "The Soil Conservation Service Runoff Curve Number (SCS-CN) method models infiltration excess overland flow. Lowering the area-weighted composite CN exponentially increases potential soil water retention $S$, drastically cutting peak surface runoff $Q$.",
            baseline_assumptions: [
                "Hydrologic Soil Group B/C is assumed as the urban baseline matrix.",
                "Antecedent Moisture Condition II (average moisture prior to storm event) is applied."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 11.5 (Disaster Risk Reduction) & SDG 15.3 (Soil Sponge Capacity)",
            direct_applicability: "Diverts stormwater volumes from combined sewer systems, mitigating street inundation risks during intense downpours.",
            trends_earth_verification: "Corresponds to restored infiltration and Soil Organic Carbon (SOC) sponge functionality under UNCCD Indicator 15.3.1."
        },
        citations: [CITATIONS.invest_flood_risk, CITATIONS.us_epa_green_infrastructure],
        drawer_markdown: `### InVEST Urban Flood Risk Mitigation (SCS-CN)

> **Key Takeaway:** Asphalt acts like plastic wrap ($CN=98$), while green ground acts like a sponge ($CN=55\\text{--}70$), trapping rainwater before it floods streets.

#### Runoff & Infiltration Mechanics:
- **Maximum Storage:** $S = \\frac{25400}{CN} - 254$
- **Direct Runoff:** $Q = \\frac{(P - 0.2S)^2}{P + 0.8S}$

Every hectare shifted from asphalt into permeable paving, bioswales, or parkland keeps hundreds of thousands of liters of floodwater out of local roads during a 50mm storm.

*Source: USDA NRCS & Stanford Natural Capital Project.*`
    },
    // 4. ESA WorldCover 10m Land Cover Standards
    esa_worldcover: {
        id: "esa_worldcover",
        category: "land_cover_standards",
        title: "ESA WorldCover 10-Meter Land Classification",
        headline: "The Satellite Benchmark Powering Neighborhood Simulation Grids",
        youth_summary: "The European Space Agency's satellites photograph the entire globe in 10-meter squares, categorizing every patch of Earth. TurnGreen uses these exact global satellite classes to track the transformation of asphalt jungles into green neighborhoods.",
        scientific_details: {
            core_equations: [
                "Cell Resolution = 10m x 10m (100 m² per pixel)",
                "Class 50: Built-up (Impervious structures, asphalt, buildings)",
                "Class 10: Tree cover (Canopy trees, urban street corridors)",
                "Class 20/30: Shrubland & Grassland (Parks, bioswales, open lawns)"
            ],
            key_coefficients: {
                "Class 10 (Trees)": "10m pixel, albedo ~0.20, CN ~60",
                "Class 20 (Shrubs)": "10m pixel, albedo ~0.18, CN ~68",
                "Class 30 (Grass)": "10m pixel, albedo ~0.22, CN ~74",
                "Class 50 (Built-up)": "10m pixel, albedo ~0.12, CN ~98"
            },
            biophysical_mechanism: "ESA WorldCover provides globally consistent, validated 10m land cover products based on Sentinel-1 and Sentinel-2 satellite data. Interventions in the game mathematically reallocate land percentages across these standardized land classes.",
            baseline_assumptions: [
                "A standard simulated neighborhood comprises a 50-hectare area (approx. 5,000 WorldCover 10m pixels).",
                "TurnGreen policies systematically transition pixels from Class 50 into Class 10, 20, or modified Class 50 (cool surfaces)."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 15.3.1 Land Cover Sub-Indicator",
            direct_applicability: "ESA WorldCover is one of the primary approved Tier-1 global spatial datasets for UNCCD Trends.Earth reporting.",
            trends_earth_verification: "Directly satisfies the Land Cover Change sub-indicator requirement under the UNCCD reporting matrix."
        },
        citations: [CITATIONS.esa_worldcover_2021, CITATIONS.un_sdg_15_3_1_metadata],
        drawer_markdown: `### ESA WorldCover 10m Benchmark

> **Key Takeaway:** Real satellites track cities in 10m squares. TurnGreen uses real European Space Agency classes to track land changes.

#### Core Spatial Classes:
- **Class 50 (Built-up):** Impervious asphalt, rooftops, concrete roads.
- **Class 10 (Tree Cover):** Street trees, urban forest canopy.
- **Class 20 / 30 (Grass & Shrubs):** Parks, bioswales, rain gardens.

*Source: European Space Agency (ESA) & Sentinel Satellites.*`
    },
    // 5. Urban Canopy Trees Policy
    urban_canopy_trees: {
        id: "urban_canopy_trees",
        category: "policy_interventions",
        title: "Urban Canopy Expansion: Street Trees & Green Corridors",
        headline: "Dual-Action Cooling and Stormwater Interception",
        youth_summary: "Planting street trees transforms hot asphalt streets into shaded tunnels. Mature tree canopies intercept rainwater before it even hits the ground, while leaf evaporation cools neighborhood air like natural air conditioning.",
        scientific_details: {
            core_equations: [
                "Net Evapotranspiration ET_r = 0.90",
                "Canopy Shade Coefficient = 0.95",
                "Composite Curve Number shift: Class 50 (98) -> Class 10 (60)"
            ],
            key_coefficients: {
                "Unit Cost": "$25,000 per 1% neighborhood conversion",
                "Cooling Impact": "High (Shade + Evapotranspiration)",
                "Runoff Impact": "Moderate (Canopy interception + root infiltration)"
            },
            biophysical_mechanism: "Foliage blocks shortwave solar radiation and converts sensible heat to latent heat via transpiration. Roots aerate soil, dramatically increasing infiltration rates.",
            baseline_assumptions: [
                "Trees planted are climate-resilient native species.",
                "Maintenance programs ensure canopy health and root volume expansion."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 15.3.1 (Sub-Indicators 1 & 2)",
            direct_applicability: "Restores vegetative productivity (LPD) and transitions land from built-up to tree cover.",
            trends_earth_verification: "Reverses artificial land degradation under UNCCD Trends.Earth land cover transition guidelines."
        },
        citations: [CITATIONS.invest_urban_cooling, CITATIONS.invest_flood_risk, CITATIONS.un_sdg_15_3_1_metadata],
        drawer_markdown: `### Urban Canopy Expansion

> **Key Takeaway:** Street trees are the most complete natural infrastructure: they provide shade, cool the air through water vapor, and drink up stormwater.

#### Model Parameters:
- **Evapotranspiration Index:** $ET_r = 0.90$
- **Shade Factor:** $0.95$
- **WorldCover Transition:** Built-up (Class 50) $\\rightarrow$ Tree cover (Class 10)

*Source: Stanford InVEST & UNCCD Trends.Earth.*`
    },
    // 6. Permeable Pavement Policy
    permeable_pavement: {
        id: "permeable_pavement",
        category: "policy_interventions",
        title: "Permeable Pavement & De-paved Public Plazas",
        headline: "Unsealing Urban Soils to Prevent Flash Flooding",
        youth_summary: "Permeable plazas replace solid asphalt with porous interlocking pavers, gravel beds, or open ground. Rain drains straight through into the soil below instead of pooling into flash floods on the road.",
        scientific_details: {
            core_equations: [
                "Runoff Curve Number shift: CN 98 -> CN 70",
                "Retention Storage S = (25400 / 70) - 254 = 108.8 mm (vs 5.2 mm for asphalt)",
                "Direct Runoff Q reduction: ~70% drop for 50mm design storm"
            ],
            key_coefficients: {
                "Unit Cost": "$20,000 per 1% neighborhood conversion",
                "Runoff Impact": "Very High (Triples retention capacity)",
                "Cooling Impact": "Moderate (Slight albedo increase ~0.20)"
            },
            biophysical_mechanism: "Eliminates the impermeable barrier between atmosphere and subterranean soil. Restores gravity drainage and natural water table recharge.",
            baseline_assumptions: [
                "Aggregate stone reservoir base underneath provides temporary detention during cloudbursts.",
                "Periodic vacuum sweeping prevents void clogging."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 15.3.1 (Sub-Indicator 3: Soil Carbon & Infiltration)",
            direct_applicability: "Halts soil asphyxiation under asphalt, re-establishing soil gas exchange and organic sponge mechanics.",
            trends_earth_verification: "Recognized as de-sealing and restored soil integrity under UNCCD LDN frameworks."
        },
        citations: [CITATIONS.invest_flood_risk, CITATIONS.us_epa_green_infrastructure],
        drawer_markdown: `### Permeable Pavement & De-paving

> **Key Takeaway:** De-paving removes the asphalt seal so rainwater can seep naturally into the ground.

#### Hydrological Parameters:
- **Asphalt CN:** $98$ (95% runoff)
- **Permeable Paver CN:** $70$ (drastic drop in surface runoff)
- **Storage Potential:** $S$ increases from $5.2\\text{ mm}$ to $108.8\\text{ mm}$.

*Source: US EPA Green Infrastructure & InVEST Flood Model.*`
    },
    // 7. Bioswales Policy
    bioswales: {
        id: "bioswales",
        category: "policy_interventions",
        title: "Bioswales & Bioretention Rain Gardens",
        headline: "Engineered Natural Sponges for Curbside Stormwater Infiltration",
        youth_summary: "Bioswales look like shallow, beautiful garden ditches along street curbs, but underneath they contain engineered layers of compost, sand, and deep-rooted native plants designed to trap and clean street runoff within minutes.",
        scientific_details: {
            core_equations: [
                "Runoff Curve Number shift: CN 98 -> CN 55",
                "Retention Storage S = (25400 / 55) - 254 = 207.8 mm",
                "Runoff Retention Efficiency: >85% for standard 50mm storm"
            ],
            key_coefficients: {
                "Unit Cost": "$18,000 per 1% neighborhood conversion",
                "Runoff Impact": "Maximum (Lowest Curve Number)",
                "Cooling Impact": "Moderate-High (Evaporative cooling from saturated soil + vegetation)"
            },
            biophysical_mechanism: "Combines physical sedimentation, biological filtration through native plant roots, and rapid deep percolation into soil layers.",
            baseline_assumptions: [
                "Equipped with overflow bypass drains for 100-year storm safety.",
                "Vegetated with hydrophilic native shrubs and perennials."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 15.3.1 (Sub-Indicators 1, 2 & 3)",
            direct_applicability: "Simultaneously increases vegetative biomass (LPD), restores soil organic matter (SOC), and replaces artificial surfaces.",
            trends_earth_verification: "Triple-benefit land restoration under UNCCD Trends.Earth 1OAO scoring."
        },
        citations: [CITATIONS.invest_flood_risk, CITATIONS.us_epa_green_infrastructure, CITATIONS.unccd_trends_earth],
        drawer_markdown: `### Bioswales & Rain Gardens

> **Key Takeaway:** Curbside rain gardens filter and swallow heavy stormwater before it reaches storm sewers.

#### Key Mechanics:
- **Curve Number:** $CN = 55$ (Superior natural sponge)
- **Soil Retention:** Absorbs up to $207\\text{ mm}$ of potential rainfall depth.
- **Triple UNCCD Benefit:** Improves vegetative cover, plant productivity, and soil carbon.

*Source: US EPA & Stanford InVEST.*`
    },
    // 8. Green Roofs Policy
    green_roofs: {
        id: "green_roofs",
        category: "policy_interventions",
        title: "Green Roof Retrofits: Living Building Canopies",
        headline: "Insulating Buildings While Mitigating Street Heat and Roof Runoff",
        youth_summary: "Green roofs replace hot gravel and tar on top of flat buildings with drought-tolerant succulent plants (sedum). They keep buildings cooler inside, reduce air conditioning strain, and absorb rain before it reaches street gutters.",
        scientific_details: {
            core_equations: [
                "Effective Albedo boost: 0.12 (tar/gravel) -> 0.25 (sedum/soil)",
                "ET_r Index: 0.70",
                "Roof Runoff Retention: Retains 40-60% of precipitation volume"
            ],
            key_coefficients: {
                "Unit Cost": "$30,000 per 1% neighborhood conversion",
                "Cooling Impact": "Moderate-High (Combined albedo + building insulation)",
                "Runoff Impact": "Moderate (Immediate rooftop detention)"
            },
            biophysical_mechanism: "Sedum and engineered growing media provide thermal mass and latent heat cooling via transpiration while delaying peak rooftop runoff timing.",
            baseline_assumptions: [
                "Applied to commercial and multi-family flat roofs with sufficient structural load capacity.",
                "Extensive green roof configuration (shallow substrate 8–15cm)."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 11.B & SDG 15.3.1 (Urban Productivity)",
            direct_applicability: "Creates elevated vegetative patches in dense urban corridors where ground-level space is constrained.",
            trends_earth_verification: "Contributes to net primary productivity gains (LPD) within dense built-up zones."
        },
        citations: [CITATIONS.santamouris_cool_cities, CITATIONS.invest_urban_cooling],
        drawer_markdown: `### Green Roof Retrofits

> **Key Takeaway:** Turns baking rooftops into gardens, cooling the building and stopping roof runoff.

#### Performance:
- **Albedo & Transpiration:** Boosts reflectivity and provides $ET_r = 0.70$.
- **Thermal Shield:** Cuts indoor cooling demand and stops rooftops from re-radiating heat into the street.

*Source: Solar Energy / Santamouris & InVEST.*`
    },
    // 9. Cool Roofs Policy
    cool_roofs: {
        id: "cool_roofs",
        category: "policy_interventions",
        title: "Cool Surface & Reflective Roof Retrofits",
        headline: "Maximizing Solar Reflectance (Albedo) to Cool Urban Neighborhoods",
        youth_summary: "Cool roofs use specially coated white paints or membranes that bounce over 70% of sunlight straight back into outer space. They are one of the cheapest, fastest ways to immediately drop neighborhood heat.",
        scientific_details: {
            core_equations: [
                "Solar Reflectance (Albedo) shift: 0.12 (black asphalt) -> 0.72 (high-SR coating)",
                "Thermal Emittance: >0.85",
                "Surface Temperature Reduction: Up to 25°C cooler surface than dark roofs"
            ],
            key_coefficients: {
                "Unit Cost": "$15,000 per 1% neighborhood conversion",
                "Cooling Impact": "High Albedo Radiative Forcing",
                "Runoff Impact": "Neutral (Surface remains impervious)"
            },
            biophysical_mechanism: "High solar reflectance reflects ultraviolet, visible, and infrared wavelengths, while high thermal emittance releases any absorbed heat into the sky.",
            baseline_assumptions: [
                "Targeted at industrial warehouses, retail centers, and flat municipal rooftops.",
                "Maintenance entails periodic cleaning to maintain solar reflectance."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 13.1 (Climate Resilience) & SDG 11.7",
            direct_applicability: "Low-cost, rapid deployment strategy for curbing extreme heat in frontline communities.",
            trends_earth_verification: "Does not shift land cover class, but mitigates thermal degradation of urban settlements."
        },
        citations: [CITATIONS.akbari_albedo_cooling, CITATIONS.santamouris_cool_cities],
        drawer_markdown: `### Cool Surface & Reflective Roofs

> **Key Takeaway:** High-albedo white roofs act like a giant mirror, bouncing solar heat back into space.

#### Physics of Albedo:
- **Standard Roof Albedo:** $0.12$ (soaks up 88% of solar heat)
- **Cool Roof Albedo:** $0.72$ (reflects 72% of solar energy away)
- **Cost Effectiveness:** Lowest cost per degree of temperature reduction.

*Source: Climatic Change / Akbari et al. & Stanford InVEST.*`
    },
    // 10. Pocket Parks Policy
    pocket_parks: {
        id: "pocket_parks",
        category: "policy_interventions",
        title: "Pocket Parks & De-paved Community Green Space",
        headline: "Micro-Greenspace Creation for Community Wellness and Microclimates",
        youth_summary: "Pocket parks take small vacant asphalt lots or oversized street corners and turn them into miniature neighborhood parks with shade trees, grass, and benches. They create an oasis of cool air and flood relief right where people live.",
        scientific_details: {
            core_equations: [
                "Land Cover Transition: Built-up 50 -> Tree Cover 10 (40%) + Grassland 30 (60%)",
                "Composite CN: 68",
                "Composite ET_r: 0.80"
            ],
            key_coefficients: {
                "Unit Cost": "$22,000 per 1% neighborhood conversion",
                "Cooling Impact": "High",
                "Runoff Impact": "High",
                "Social / Community Cheer": "Highest"
            },
            biophysical_mechanism: "Blends canopy microclimate moderation with open ground infiltration and active community green recreation.",
            baseline_assumptions: [
                "Distributed evenly across dense, park-deficient residential blocks.",
                "Includes permeable walkways and native groundcover."
            ]
        },
        un_sdg_connection: {
            target_code: "SDG 11.7 (Universal Access to Green Public Spaces) & SDG 15.3.1",
            direct_applicability: "Provides direct community access to green spaces while retiring degraded impervious land.",
            trends_earth_verification: "Categorized as full land restoration from Built-up (Class 50) to Vegetated classes under Trends.Earth."
        },
        citations: [CITATIONS.un_sdg_15_3_1_metadata, CITATIONS.invest_urban_cooling, CITATIONS.invest_flood_risk],
        drawer_markdown: `### Pocket Parks & Community Greenspaces

> **Key Takeaway:** Small, neighborhood-scale parks deliver big results: they cool the block, absorb rain, and boost community happiness.

#### Balanced Ecological Profile:
- **Dual Conversion:** 40% Tree Canopy + 60% Grassland/Soil
- **Evapotranspiration Index:** $ET_r = 0.80$
- **Infiltration:** $CN = 68$

*Source: UN SDG 11.7 & Stanford InVEST.*`
    }
};
