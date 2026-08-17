import {
  RULE_PRECEDENCE,
  type RuleOperation,
  type RuleTraceEntry,
  type VariableId,
} from "@motor-fisiologico/contracts";

const LAYER_INDEX = new Map(RULE_PRECEDENCE.map((layer, index) => [layer, index] as const));

export interface RuleResolution {
  values: Readonly<Record<VariableId, number>>;
  trace: readonly RuleTraceEntry[];
}

function applyOperation(before: number, operation: RuleOperation): number {
  switch (operation.operation) {
    case "set":
      if (operation.value === undefined) throw new Error(`Rule ${operation.id}: set requires value`);
      return operation.value;
    case "add":
      if (operation.value === undefined) throw new Error(`Rule ${operation.id}: add requires value`);
      return before + operation.value;
    case "multiply":
      if (operation.value === undefined) throw new Error(`Rule ${operation.id}: multiply requires value`);
      return before * operation.value;
    case "clamp": {
      if (operation.min === undefined && operation.max === undefined) {
        throw new Error(`Rule ${operation.id}: clamp requires min and/or max`);
      }
      let result = before;
      if (operation.min !== undefined) result = Math.max(operation.min, result);
      if (operation.max !== undefined) result = Math.min(operation.max, result);
      return result;
    }
  }
}

export function resolveRuleOperations(
  baseValues: Readonly<Record<VariableId, number>>,
  operations: readonly RuleOperation[],
): RuleResolution {
  const values: Record<VariableId, number> = { ...baseValues };
  const trace: RuleTraceEntry[] = [];

  const ordered = operations
    .map((operation, insertionIndex) => ({ operation, insertionIndex }))
    .sort((a, b) => {
      const layerDiff = (LAYER_INDEX.get(a.operation.layer) ?? Number.MAX_SAFE_INTEGER)
        - (LAYER_INDEX.get(b.operation.layer) ?? Number.MAX_SAFE_INTEGER);
      return layerDiff !== 0 ? layerDiff : a.insertionIndex - b.insertionIndex;
    });

  for (const { operation } of ordered) {
    const before = values[operation.target];
    if (before === undefined && operation.operation !== "set") {
      throw new Error(`Rule ${operation.id}: target ${operation.target} has no base value`);
    }
    const after = applyOperation(before ?? 0, operation);
    if (!Number.isFinite(after)) throw new Error(`Rule ${operation.id}: produced non-finite value`);
    values[operation.target] = after;
    trace.push({
      layer: operation.layer,
      ruleId: operation.id,
      target: operation.target,
      ...(before === undefined ? {} : { before }),
      after,
      ...(operation.note === undefined ? {} : { note: operation.note }),
    });
  }

  return { values, trace };
}
