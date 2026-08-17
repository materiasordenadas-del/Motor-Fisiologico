import { describe, expect, it } from "vitest";
import { compareNumericSeries } from "./conformance.js";

describe("mathematical conformance", () => {
  it("uses atol + rtol * abs(reference)", () => {
    const pass = compareNumericSeries([100, 200], [100.05, 199.9], { absolute: 0.01, relative: 0.001 });
    expect(pass.passed).toBe(true);

    const fail = compareNumericSeries([100], [101], { absolute: 0.01, relative: 0.001 });
    expect(fail.passed).toBe(false);
    expect(fail.failures).toHaveLength(1);
  });
});
