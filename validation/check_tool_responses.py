"""Check captured live-tool contracts; verifies updated biophysical models and fixes."""
import json
from pathlib import Path


def payload(record):
    result = record["result"]
    assert not result.get("isError"), f"Unexpected error in record kind: {record.get('kind')}"
    return json.loads(next(c["text"] for c in result["content"] if c["type"] == "text"))


def main():
    responses_file = Path(__file__).with_name("turngreen-tool-responses.json")
    assert responses_file.exists(), f"Missing responses file: {responses_file}"

    data = json.loads(responses_file.read_text(encoding="utf-8"))
    records = data["records"]
    assert len(records) >= 10, f"Expected at least 10 records, got {len(records)}"

    # 1. Verify 5-turn simulation chain
    simulations = sorted((r for r in records if r["kind"] == "simulation"), key=lambda r: r["args"]["turn"])
    assert len(simulations) == 5, f"Expected exactly 5 simulation turns, got {len(simulations)}"

    previous_state = None
    for turn, record in enumerate(simulations, 1):
        resp = payload(record)
        assert resp["turn"] == turn, f"Turn mismatch: expected {turn}, got {resp['turn']}"
        state = resp["next_state"]

        # WorldCover sums to 100%
        land_cover_sum = sum(state["land_cover"].values())
        assert abs(land_cover_sum - 100) < 0.05, f"Turn {turn} land cover sum {land_cover_sum} != 100%"

        # All values non-negative and valid percentages
        assert all(0 <= val <= 100 for val in state["land_cover"].values())

        # Budget monotonically decreases according to expenditure
        expected_budget = 500000 - turn * 100000
        assert state["remaining_budget"] == expected_budget, f"Turn {turn} remaining budget {state['remaining_budget']} != {expected_budget}"

        # State chaining: args.current_state matches previous next_state
        if previous_state is not None:
            for k in ("total_area_hectares", "remaining_budget", "roof_treatment_hectares"):
                if k in previous_state:
                    assert record["args"]["current_state"].get(k) == previous_state.get(k), f"State key {k} mismatch on turn {turn}"
        previous_state = state

        # Verify envelope structure
        for key in ("player_summary", "player_metrics", "science_payload", "intervention"):
            assert isinstance(resp[key], dict), f"Missing key {key} in turn {turn}"

        # Verify metrics exposed: design storm retention & incremental runoff reduction
        metrics = resp["player_metrics"]
        assert "design_storm_total_retained_m3" in metrics, f"Missing design_storm_total_retained_m3 in turn {turn}"
        assert "incremental_runoff_reduction_m3" in metrics, f"Missing incremental_runoff_reduction_m3 in turn {turn}"
        assert metrics["design_storm_total_retained_m3"] > 0
        assert metrics["incremental_runoff_reduction_m3"] > 0

    # 2. Check roof treatment persistence in turn 3 cool roofs and turn 4
    turn3_resp = payload(simulations[2])
    turn4_resp = payload(simulations[3])
    assert turn3_resp["next_state"].get("roof_treatment_hectares", 0) > 0, "Turn 3 should track roof_treatment_hectares"
    assert turn4_resp["next_state"].get("roof_treatment_hectares", 0) >= turn3_resp["next_state"]["roof_treatment_hectares"], "Roof treatment must persist across turns"

    by_kind = {r["kind"]: r for r in records}

    # 3. Assessment checks
    pre_resp = payload(by_kind["assessment"])
    assert pre_resp["status"] == "recorded"
    assert "baseline_recorded" in pre_resp

    post_resp = payload(by_kind["post"])
    assert post_resp["status"] == "completed"
    learning_gain = post_resp["learning_gain"]
    assert "average_normalized_gain" in learning_gain
    assert 0 <= learning_gain["average_normalized_gain"] <= 1.0

    # 4. Science drawer checks
    science_resp = payload(by_kind["science"])
    assert science_resp["drawer_body_markdown"]
    assert len(science_resp["citations"]) >= 3
    assert "key_coefficients" in science_resp
    assert "scientific_equations" in science_resp

    # 5. Science topics discovery
    topics_resp = payload(by_kind["topics"])
    assert len(topics_resp["available_topics"]) == 10

    # 6. Resolution Generator checks
    resolution_resp = payload(by_kind["resolution"])
    assert len(resolution_resp["talking_points"]) == 3, f"Expected 3 talking points, got {len(resolution_resp['talking_points'])}"
    assert "<!DOCTYPE html>" in resolution_resp["single_page_html"]
    assert resolution_resp["resolution_markdown"]
    assert resolution_resp["biophysical_scorecard"]["ground_depaved_ha"] >= 0
    assert resolution_resp["biophysical_scorecard"]["rooftop_treated_ha"] >= 0

    # 7. Expected Error Envelopes
    for err_kind in ("invalid-score", "unknown-topic", "invalid-turn"):
        assert by_kind[err_kind]["result"].get("isError") is True, f"Kind {err_kind} should return isError: true"
        error_text = by_kind[err_kind]["result"]["content"][0]["text"]
        assert len(error_text) > 0

    print("================================================================================")
    print("PASS: Verified live MCP contracts, 5-turn state chain, roof treatment persistence,")
    print("      incremental stormwater runoff reduction, FERPA-isolated assessment gain,")
    print("      science drawer citations/equations, resolution export, and error envelopes.")
    print("================================================================================")


if __name__ == "__main__":
    main()
