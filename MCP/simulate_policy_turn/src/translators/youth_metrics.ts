import { InterventionType } from "../types.js";

interface AnalogyInputs {
  tempDropDeltaC: number;
  stormwaterRetainedM3: number;
  newCoolingScore: number;
  newFloodScore: number;
  interventionId: InterventionType;
  interventionName: string;
}

export function generateYouthSummary(inputs: AnalogyInputs) {
  const {
    tempDropDeltaC,
    stormwaterRetainedM3,
    newCoolingScore,
    newFloodScore,
    interventionName
  } = inputs;

  // Analogy calculations:
  // Olympic swimming pool = ~2,500 m3
  // Average bathtub = ~0.3 m3
  const olympicPools = (stormwaterRetainedM3 / 2500).toFixed(1);
  const bathtubs = Math.round(stormwaterRetainedM3 / 0.3).toLocaleString();

  let waterAnalogy = `Soaked up ${stormwaterRetainedM3.toLocaleString()} m³ of rain—equivalent to filling ${olympicPools} Olympic swimming pools (or ~${bathtubs} full bathtubs)!`;
  if (parseFloat(olympicPools) < 1.0) {
    waterAnalogy = `Absorbed ${stormwaterRetainedM3.toLocaleString()} m³ of rainwater—that's roughly ${bathtubs} backyard bathtubs saved from storm drains!`;
  }

  // Star ratings (1 to 5)
  const coolingStars = Math.min(5, Math.max(1, Math.round(newCoolingScore / 20)));

  // Headlines and takeaways
  let headline = `${interventionName} deployed across the neighborhood!`;
  let youthTakeaway = "";
  let vibe = "Warm & Humid";

  if (newCoolingScore >= 80 && newFloodScore >= 80) {
    headline = `Spectacular transformation! ${interventionName} creates an urban oasis.`;
    youthTakeaway = "The neighborhood feels like an enchanted forest park. Shade and cool breezes are everywhere!";
    vibe = "Oasis Breeze (Super Chill ❄️)";
  } else if (newCoolingScore >= 60 || newFloodScore >= 60) {
    headline = `Big climate win! ${interventionName} cools streets and absorbs rain.`;
    youthTakeaway = "Playgrounds are cooler at noon, and street puddles vanish almost immediately after downpours!";
    vibe = "Pleasantly Fresh (Comfortable 🌳)";
  } else {
    headline = `First steps underway with ${interventionName}.`;
    youthTakeaway = "New greenery is taking root. Less dark asphalt means the heat starts to back off!";
    vibe = "Summer Sun (Starting to Cool Down 🌤️)";
  }

  const tempDropDisplay = tempDropDeltaC > 0 
    ? `-${tempDropDeltaC.toFixed(2)}°C (-${(tempDropDeltaC * 1.8).toFixed(2)}°F)`
    : "0.0°C (Baseline)";

  return {
    headline,
    youth_takeaway: youthTakeaway,
    cooling_stars: coolingStars,
    temperature_drop_display: tempDropDisplay,
    water_retention_analogy: waterAnalogy,
    neighborhood_vibe: vibe
  };
}
