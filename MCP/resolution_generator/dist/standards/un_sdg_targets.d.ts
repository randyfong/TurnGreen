/**
 * UN Sustainable Development Goal 15.3.1 and UNCCD Land Degradation Neutrality (LDN) Standards
 * Reference metadata and statutory framing for TurnGreen youth resolutions.
 */
export interface SDGTargetStandard {
    goal: string;
    target: string;
    indicator: string;
    custodian: string;
    trends_earth_metric: string;
    legal_precedent_framing: string;
    scientific_citation: string;
}
export declare const UN_SDG_15_3_1_STANDARD: SDGTargetStandard;
export declare const INVEST_COOLING_STANDARD: {
    model: string;
    citation: string;
    principle: string;
};
export declare const INVEST_FLOOD_STANDARD: {
    model: string;
    citation: string;
    principle: string;
};
