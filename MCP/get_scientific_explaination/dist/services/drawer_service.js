import { SDG_15_3_1_DATA } from "../data/sdg_15_3_1.js";
export function formatDrawerMarkdown(topic, audience) {
    let bodyMd = "";
    if (audience === "youth") {
        bodyMd = `## ${topic.title}
### ${topic.headline}

${topic.youth_summary}

---
### 🌿 Why It Matters for Your City
${topic.drawer_markdown}

---
### 📚 Verified Evidence
${topic.citations
            .map((c) => `- **${c.title}** (${c.year}) - *${c.publisher_or_journal}* [Link](${c.doi_or_url})`)
            .join("\n")}`;
    }
    else if (audience === "technical") {
        const eqBlock = topic.scientific_details.core_equations
            ? `#### Core Equations & Mathematical Formulation:\n` +
                topic.scientific_details.core_equations.map((eq) => `\`${eq}\``).join("\n") +
                "\n\n"
            : "";
        const coefBlock = topic.scientific_details.key_coefficients
            ? `#### Key Coefficients & Calibration:\n` +
                Object.entries(topic.scientific_details.key_coefficients)
                    .map(([k, v]) => `- **${k}**: \`${v}\``)
                    .join("\n") +
                "\n\n"
            : "";
        bodyMd = `## Scientific Documentation: ${topic.title}

### Biophysical Mechanism
${topic.scientific_details.biophysical_mechanism}

${eqBlock}${coefBlock}### Model Assumptions & Constraints
${topic.scientific_details.baseline_assumptions.map((a) => `- ${a}`).join("\n")}

---
### UN SDG 15.3.1 / Trends.Earth Alignment
${topic.un_sdg_connection?.direct_applicability ?? "N/A"}
**Verification**: ${topic.un_sdg_connection?.trends_earth_verification ?? "N/A"}

---
### Authoritative Citations
${topic.citations
            .map((c) => `- ${c.authors.join(", ")} (${c.year}). *${c.title}*. ${c.publisher_or_journal}. DOI/URL: <${c.doi_or_url}>`)
            .join("\n")}`;
    }
    else {
        // audience === "all"
        const eqList = topic.scientific_details.core_equations
            ? `\n#### Mathematical Equations\n` +
                topic.scientific_details.core_equations.map((eq) => `- \`${eq}\``).join("\n")
            : "";
        bodyMd = `## ${topic.title}
*${topic.headline}*

### Accessible Overview
${topic.youth_summary}

---
${topic.drawer_markdown}
${eqList}

---
### Biophysical Mechanism & Baseline Assumptions
${topic.scientific_details.biophysical_mechanism}

**Assumptions:**
${topic.scientific_details.baseline_assumptions.map((a) => `- ${a}`).join("\n")}

---
### UN Sustainable Development Goals (SDG 15.3.1) Alignment
- **Indicator**: ${SDG_15_3_1_DATA.indicator}
- **Custodian**: ${SDG_15_3_1_DATA.custodian_agency}
- **Connection**: ${topic.un_sdg_connection?.direct_applicability ?? "Avoided land degradation"}
- **Trends.Earth Compliance**: ${topic.un_sdg_connection?.trends_earth_verification ?? "One Out, All Out (1OAO) protocol"}

---
### Verified Scientific Citations
${topic.citations
            .map((c) => `- **${c.title}** (${c.year}) - *${c.publisher_or_journal}* by ${c.authors.slice(0, 3).join(", ")}${c.authors.length > 3 ? " et al." : ""}. [Source Link](${c.doi_or_url})`)
            .join("\n")}`;
    }
    return {
        topic_id: topic.id,
        category: topic.category,
        title: topic.title,
        headline: topic.headline,
        audience_selected: audience,
        drawer_header: {
            title: topic.title,
            badge: topic.category.replace(/_/g, " ").toUpperCase(),
            summary: topic.youth_summary
        },
        drawer_body_markdown: bodyMd,
        scientific_equations: topic.scientific_details.core_equations,
        key_coefficients: topic.scientific_details.key_coefficients,
        un_sdg_framework: {
            indicator_code: SDG_15_3_1_DATA.indicator,
            target_summary: SDG_15_3_1_DATA.target,
            sub_indicators: SDG_15_3_1_DATA.sub_indicators.map((s) => ({
                name: s.name,
                rule: s.trends_earth_rule,
                game_connection: s.game_connection
            }))
        },
        citations: topic.citations.map((c) => ({
            title: c.title,
            authors: c.authors,
            year: c.year,
            source: c.publisher_or_journal,
            link: c.doi_or_url
        }))
    };
}
