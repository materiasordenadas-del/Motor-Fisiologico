import type {
  ConformanceFailure,
  ConformanceResult,
  ConformanceTolerance,
} from "@motor-fisiologico/contracts";

export function compareNumericSeries(
  reference: readonly number[],
  actual: readonly number[],
  tolerance: ConformanceTolerance,
): ConformanceResult {
  if (reference.length !== actual.length) {
    throw new Error(`Conformance series length mismatch: ${reference.length} != ${actual.length}`);
  }
  if (tolerance.absolute < 0 || tolerance.relative < 0) {
    throw new Error("Conformance tolerances must be non-negative");
  }

  const failures: ConformanceFailure[] = [];
  for (let index = 0; index < reference.length; index += 1) {
    const expected = reference[index];
    const observed = actual[index];
    if (expected === undefined || observed === undefined) continue;
    if (!Number.isFinite(expected) || !Number.isFinite(observed)) {
      throw new Error(`Conformance values must be finite at index ${index}`);
    }
    const absoluteError = Math.abs(observed - expected);
    const allowedError = tolerance.absolute + tolerance.relative * Math.abs(expected);
    if (absoluteError > allowedError) {
      failures.push({ index, reference: expected, actual: observed, absoluteError, allowedError });
    }
  }

  return {
    passed: failures.length === 0,
    compared: reference.length,
    failures,
  };
}
