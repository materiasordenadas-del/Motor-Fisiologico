import { describe, expect, it } from "vitest";
import { resolveRuleOperations } from "./rule-resolver.js";

describe("rule precedence", () => {
  it("applies general -> local -> disease -> treatment -> constraint -> result regardless of input order", () => {
    const result = resolveRuleOperations(
      { "test.x": 10 },
      [
        { id: "constraint", layer: "constraint", target: "test.x", operation: "clamp", max: 20 },
        { id: "treatment", layer: "treatment_modifier", target: "test.x", operation: "add", value: -2 },
        { id: "general", layer: "general_principle", target: "test.x", operation: "multiply", value: 2 },
        { id: "disease", layer: "disease_modifier", target: "test.x", operation: "add", value: 5 },
        { id: "local", layer: "local_specification", target: "test.x", operation: "add", value: 1 },
        { id: "result", layer: "result", target: "test.x", operation: "multiply", value: 2 },
      ],
    );

    expect(result.values["test.x"]).toBe(40);
    expect(result.trace.map((entry) => entry.ruleId)).toEqual([
      "general",
      "local",
      "disease",
      "treatment",
      "constraint",
      "result",
    ]);
  });
});
