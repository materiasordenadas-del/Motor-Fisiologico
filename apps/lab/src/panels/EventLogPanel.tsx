import type { LabLogEntry } from "../engine/usePhysiologyWorker.js";

export interface EventLogPanelProps {
  logs: readonly LabLogEntry[];
}

export function EventLogPanel({ logs }: EventLogPanelProps) {
  const visibleLogs = [...logs].slice(-80).reverse();

  return (
    <section className="panel event-panel" aria-label="Graphs and simulation events">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">TRACE</span>
          <h2>Graphs / Events</h2>
        </div>
        <span className="panel-meta">{logs.length} entries</span>
      </div>

      <div className="event-log">
        {visibleLogs.length === 0 ? (
          <p className="empty-copy">Event stream active. Physiological plots appear when an experiment exposes variables.</p>
        ) : (
          visibleLogs.map((entry) => (
            <div className={`event-row ${entry.level}`} key={entry.id}>
              <span className="event-source">{entry.source}</span>
              <code>{entry.message}</code>
              <span className="event-time">
                {entry.simulationTimeSeconds === undefined ? "—" : `${entry.simulationTimeSeconds.toFixed(2)} s`}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
