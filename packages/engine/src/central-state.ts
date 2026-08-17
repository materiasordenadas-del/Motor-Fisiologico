import type {
  RuleTraceEntry,
  VariableDefinition,
  VariableId,
} from "@motor-fisiologico/contracts";

export class CentralState {
  #definitions = new Map<VariableId, VariableDefinition>();
  #values = new Map<VariableId, number>();
  #trace: RuleTraceEntry[] = [];

  constructor(definitions: readonly VariableDefinition[] = []) {
    for (const definition of definitions) {
      this.registerDefinition(definition);
    }
  }

  registerDefinition(definition: VariableDefinition): void {
    if (this.#definitions.has(definition.id)) {
      throw new Error(`Variable already defined: ${definition.id}`);
    }
    this.#definitions.set(definition.id, definition);
  }

  definition(variableId: VariableId): VariableDefinition {
    const definition = this.#definitions.get(variableId);
    if (!definition) throw new Error(`Unknown variable: ${variableId}`);
    return definition;
  }

  setCanonical(variableId: VariableId, value: number): void {
    this.definition(variableId);
    if (!Number.isFinite(value)) {
      throw new Error(`Variable ${variableId} must be finite`);
    }
    this.#values.set(variableId, value);
  }

  get(variableId: VariableId): number | undefined {
    this.definition(variableId);
    return this.#values.get(variableId);
  }

  has(variableId: VariableId): boolean {
    return this.#values.has(variableId);
  }

  values(): Readonly<Record<VariableId, number>> {
    return Object.fromEntries(this.#values.entries());
  }

  definitions(): readonly VariableDefinition[] {
    return [...this.#definitions.values()];
  }

  setTrace(trace: readonly RuleTraceEntry[]): void {
    this.#trace = [...trace];
  }

  trace(): readonly RuleTraceEntry[] {
    return [...this.#trace];
  }

  resetValues(): void {
    this.#values.clear();
    this.#trace = [];
  }
}
