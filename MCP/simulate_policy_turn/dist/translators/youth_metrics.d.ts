import { InterventionType } from "../types.js";
interface AnalogyInputs {
    tempDropDeltaC: number;
    stormwaterRetainedM3: number;
    newCoolingScore: number;
    newFloodScore: number;
    interventionId: InterventionType;
    interventionName: string;
}
export declare function generateYouthSummary(inputs: AnalogyInputs): {
    headline: string;
    youth_takeaway: string;
    cooling_stars: number;
    temperature_drop_display: string;
    water_retention_analogy: string;
    neighborhood_vibe: string;
};
export {};
