import { describe, expect, it } from "vitest";
import { convert, toCanonical } from "./unit-registry.js";
import { mapToScene } from "./scale-mapping.js";

describe("Unit Registry", () => {
  it("normalizes clinical flow units to SI", () => {
    const value = toCanonical(120, "mL/min");
    expect(value.canonicalUnit).toBe("m3/s");
    expect(value.canonicalValue).toBeCloseTo(2e-6, 12);
  });

  it("supports renal clinical concentration units", () => {
    expect(toCanonical(140, "mmol/L").canonicalValue).toBe(140);
    expect(toCanonical(1, "mg/dL").canonicalValue).toBeCloseTo(0.01, 12);
    expect(toCanonical(300, "mOsm/kg").canonicalValue).toBeCloseTo(0.3, 12);
  });

  it("converts compatible units and rejects incompatible dimensions", () => {
    expect(convert(7.5, "um", "m")).toBeCloseTo(7.5e-6, 14);
    expect(() => convert(1, "mmHg", "mL")).toThrow(/Incompatible unit dimensions/);
  });
});

describe("scale mapping", () => {
  it("implements the monotonic power-compression contract", () => {
    const profile = {
      id: "test-length-v0",
      domain: "length" as const,
      canonicalUnit: "m",
      mappingType: "power" as const,
      referenceValue: 1e-6,
      visualReference: 1,
      exponent: 0.25,
      minVisual: 0.01,
      maxVisual: 100,
      version: "0",
    };
    const small = mapToScene(1e-9, profile);
    const large = mapToScene(1e-6, profile);
    expect(small).toBeLessThan(large);
    expect(large).toBe(1);
  });
});
