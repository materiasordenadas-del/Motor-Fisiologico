import type { SimulationEvent } from "@motor-fisiologico/contracts";

export interface GlomerularRepresentationDecision {
  eventId: string;
  particleId: string;
  canPass: boolean;
}

export function toGlomerularRepresentationDecision(
  event: SimulationEvent,
): GlomerularRepresentationDecision | null {
  if (event.source !== "engine" || event.type !== "glomerular_filter_decision") return null;
  const particleId = event.payload?.particleId;
  const canPass = event.payload?.canPass;
  if (typeof particleId !== "string" || typeof canPass !== "boolean") return null;
  return {
    eventId: event.id,
    particleId,
    canPass,
  };
}
