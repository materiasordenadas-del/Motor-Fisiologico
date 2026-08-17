import type { ScaleProfile } from "@motor-fisiologico/contracts";

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

export function mapToScene(canonicalValue: number, profile: ScaleProfile): number {
  if (!Number.isFinite(canonicalValue) || canonicalValue < 0) {
    throw new Error("Scale input must be a finite non-negative canonical value");
  }
  if (!(profile.referenceValue > 0) || !(profile.visualReference > 0)) {
    throw new Error("Scale profile reference values must be greater than zero");
  }

  let mapped: number;
  switch (profile.mappingType) {
    case "linear":
      mapped = profile.visualReference * (canonicalValue / profile.referenceValue);
      break;
    case "power": {
      const exponent = profile.exponent;
      if (exponent === undefined || !(exponent > 0 && exponent <= 1)) {
        throw new Error("Power scale profile exponent must satisfy 0 < exponent <= 1");
      }
      mapped = profile.visualReference * Math.pow(canonicalValue / profile.referenceValue, exponent);
      break;
    }
    case "fixed":
      mapped = profile.visualReference;
      break;
    default: {
      const exhaustive: never = profile.mappingType;
      throw new Error(`Unsupported mapping type: ${exhaustive}`);
    }
  }

  return clamp(mapped, profile.minVisual, profile.maxVisual);
}
