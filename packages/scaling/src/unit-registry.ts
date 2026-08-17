import type { UnitDimension, UnitValue } from "@motor-fisiologico/contracts";

export interface UnitDefinition {
  symbol: string;
  dimension: UnitDimension;
  canonicalUnit: string;
  toCanonicalFactor: number;
}

const DEFINITIONS: readonly UnitDefinition[] = [
  { symbol: "1", dimension: "dimensionless", canonicalUnit: "1", toCanonicalFactor: 1 },

  { symbol: "m", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1 },
  { symbol: "cm", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1e-2 },
  { symbol: "mm", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1e-3 },
  { symbol: "um", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1e-6 },
  { symbol: "µm", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1e-6 },
  { symbol: "nm", dimension: "length", canonicalUnit: "m", toCanonicalFactor: 1e-9 },

  { symbol: "m2", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1 },
  { symbol: "m²", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1 },
  { symbol: "cm2", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1e-4 },
  { symbol: "cm²", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1e-4 },
  { symbol: "mm2", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1e-6 },
  { symbol: "mm²", dimension: "area", canonicalUnit: "m2", toCanonicalFactor: 1e-6 },

  { symbol: "m3", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1 },
  { symbol: "m³", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1 },
  { symbol: "L", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1e-3 },
  { symbol: "mL", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1e-6 },
  { symbol: "uL", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1e-9 },
  { symbol: "µL", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1e-9 },
  { symbol: "nL", dimension: "volume", canonicalUnit: "m3", toCanonicalFactor: 1e-12 },

  { symbol: "s", dimension: "time", canonicalUnit: "s", toCanonicalFactor: 1 },
  { symbol: "min", dimension: "time", canonicalUnit: "s", toCanonicalFactor: 60 },
  { symbol: "h", dimension: "time", canonicalUnit: "s", toCanonicalFactor: 3600 },

  { symbol: "m3/s", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1 },
  { symbol: "m³/s", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1 },
  { symbol: "L/s", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1e-3 },
  { symbol: "L/min", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1e-3 / 60 },
  { symbol: "mL/s", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1e-6 },
  { symbol: "mL/min", dimension: "flow", canonicalUnit: "m3/s", toCanonicalFactor: 1e-6 / 60 },

  { symbol: "kg", dimension: "mass", canonicalUnit: "kg", toCanonicalFactor: 1 },
  { symbol: "g", dimension: "mass", canonicalUnit: "kg", toCanonicalFactor: 1e-3 },
  { symbol: "mg", dimension: "mass", canonicalUnit: "kg", toCanonicalFactor: 1e-6 },
  { symbol: "ug", dimension: "mass", canonicalUnit: "kg", toCanonicalFactor: 1e-9 },
  { symbol: "µg", dimension: "mass", canonicalUnit: "kg", toCanonicalFactor: 1e-9 },

  { symbol: "mol", dimension: "amount", canonicalUnit: "mol", toCanonicalFactor: 1 },
  { symbol: "mmol", dimension: "amount", canonicalUnit: "mol", toCanonicalFactor: 1e-3 },
  { symbol: "umol", dimension: "amount", canonicalUnit: "mol", toCanonicalFactor: 1e-6 },
  { symbol: "µmol", dimension: "amount", canonicalUnit: "mol", toCanonicalFactor: 1e-6 },

  { symbol: "Pa", dimension: "pressure", canonicalUnit: "Pa", toCanonicalFactor: 1 },
  { symbol: "kPa", dimension: "pressure", canonicalUnit: "Pa", toCanonicalFactor: 1e3 },
  { symbol: "mmHg", dimension: "pressure", canonicalUnit: "Pa", toCanonicalFactor: 133.322387415 },

  { symbol: "mol/m3", dimension: "amount_concentration", canonicalUnit: "mol/m3", toCanonicalFactor: 1 },
  { symbol: "mol/L", dimension: "amount_concentration", canonicalUnit: "mol/m3", toCanonicalFactor: 1e3 },
  { symbol: "mmol/L", dimension: "amount_concentration", canonicalUnit: "mol/m3", toCanonicalFactor: 1 },
  { symbol: "umol/L", dimension: "amount_concentration", canonicalUnit: "mol/m3", toCanonicalFactor: 1e-3 },
  { symbol: "µmol/L", dimension: "amount_concentration", canonicalUnit: "mol/m3", toCanonicalFactor: 1e-3 },

  { symbol: "kg/m3", dimension: "mass_concentration", canonicalUnit: "kg/m3", toCanonicalFactor: 1 },
  { symbol: "g/L", dimension: "mass_concentration", canonicalUnit: "kg/m3", toCanonicalFactor: 1 },
  { symbol: "mg/L", dimension: "mass_concentration", canonicalUnit: "kg/m3", toCanonicalFactor: 1e-3 },
  { symbol: "mg/dL", dimension: "mass_concentration", canonicalUnit: "kg/m3", toCanonicalFactor: 1e-2 },

  { symbol: "Osm/kg", dimension: "osmolality", canonicalUnit: "Osm/kg", toCanonicalFactor: 1 },
  { symbol: "mOsm/kg", dimension: "osmolality", canonicalUnit: "Osm/kg", toCanonicalFactor: 1e-3 },
] as const;

const BY_SYMBOL = new Map(DEFINITIONS.map((definition) => [definition.symbol, definition] as const));

export const UNIT_REGISTRY: readonly UnitDefinition[] = DEFINITIONS;

export function getUnitDefinition(unit: string): UnitDefinition {
  const definition = BY_SYMBOL.get(unit);
  if (!definition) {
    throw new Error(`Unsupported unit: ${unit}`);
  }
  return definition;
}

export function toCanonical(value: number, unit: string): UnitValue {
  if (!Number.isFinite(value)) {
    throw new Error("Unit value must be finite");
  }
  const definition = getUnitDefinition(unit);
  return {
    value,
    unit,
    canonicalValue: value * definition.toCanonicalFactor,
    canonicalUnit: definition.canonicalUnit,
  };
}

export function convert(value: number, fromUnit: string, toUnit: string): number {
  const from = getUnitDefinition(fromUnit);
  const to = getUnitDefinition(toUnit);
  if (from.dimension !== to.dimension) {
    throw new Error(`Incompatible unit dimensions: ${fromUnit} (${from.dimension}) -> ${toUnit} (${to.dimension})`);
  }
  const canonical = value * from.toCanonicalFactor;
  return canonical / to.toCanonicalFactor;
}
