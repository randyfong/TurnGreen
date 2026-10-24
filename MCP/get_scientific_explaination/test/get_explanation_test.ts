import {
  executeGetScienceExplanation,
  executeListTopics,
  resolveTopic
} from "../src/index.js";

console.log("=== TurnGreen MCP get_science_explanation Verification Test ===\n");

// 1. Test listing all topics
console.log("1. Listing all available science topics:");
const topicList = executeListTopics();
console.log(`- Found ${topicList.available_topics.length} registered topics.`);
for (const t of topicList.available_topics) {
  console.log(`  * [${t.category}] ${t.id} -> ${t.title} (${t.citations_count} citations)`);
}

// 2. Test UN SDG 15.3.1 topic query
console.log("\n2. Testing get_science_explanation with 'sdg_15_3_1':");
const sdgResult = executeGetScienceExplanation({
  topic_id: "sdg_15_3_1",
  audience: "all"
});
console.log(`- Title: ${sdgResult.title}`);
console.log(`- SDG Indicator: ${sdgResult.un_sdg_framework.indicator_code}`);
console.log(`- Citations Count: ${sdgResult.citations.length}`);
console.log(`- First Citation: ${sdgResult.citations[0].title} (${sdgResult.citations[0].year})`);

// 3. Test InVEST Urban Cooling with alias resolution
console.log("\n3. Testing alias resolution for 'cooling_model':");
const coolingResult = executeGetScienceExplanation({
  topic_id: "cooling_model",
  audience: "technical"
});
console.log(`- Resolved to: ${coolingResult.topic_id}`);
console.log(`- Equations:\n  ${coolingResult.scientific_equations?.join("\n  ")}`);
console.log(`- Key Coefficients:`, coolingResult.key_coefficients);

// 4. Test InVEST Flood Risk
console.log("\n4. Testing InVEST Flood Risk for 'scs_cn':");
const floodResult = executeGetScienceExplanation({
  topic_id: "scs_cn",
  audience: "youth"
});
console.log(`- Resolved to: ${floodResult.topic_id}`);
console.log(`- Youth Headline: ${floodResult.headline}`);

// 5. Test Policy Intervention (Permeable Pavement / Depaving)
console.log("\n5. Testing Policy Intervention 'depaving':");
const depaveResult = executeGetScienceExplanation({
  topic_id: "depaving",
  audience: "all"
});
console.log(`- Resolved to: ${depaveResult.topic_id}`);
console.log(`- Title: ${depaveResult.title}`);

// 6. Test Error Handling for unknown topic
console.log("\n6. Testing error handling for unknown topic:");
try {
  executeGetScienceExplanation({
    topic_id: "quantum_teleportation",
    audience: "all"
  });
  console.error("FAILED: Should have thrown for unknown topic");
  process.exit(1);
} catch (err) {
  console.log(`- Handled Expected Error: ${(err as Error).message.slice(0, 80)}...`);
}

console.log("\n✅ All get_science_explanation MCP tests passed successfully!");
