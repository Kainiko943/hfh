import { useMemo, useState, useSyncExternalStore } from 'react'
import { missionStore } from '../state/mockStream'

export function MissionControlPage() {
  const agents = useSyncExternalStore(missionStore.subscribe, missionStore.getAgents)
  const logs = useSyncExternalStore(missionStore.subscribe, missionStore.getLogs)
  const [severity, setSeverity] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')

  const filteredLogs = useMemo(() => logs.filter((l) => severity === 'ALL' || l.severity === severity), [logs, severity])

  return (
    <div className="mission-terminal page-grid">
      <div className="terminal-ticker-row">
        <span>BTCUSDT <strong>9862.62</strong></span>
        <span>ETHUSDT <strong>5203</strong> <b className="down">-1.3%</b></span>
        <span>SOLUSDT <strong>213.9</strong> <b className="up">+1.15%</b></span>
        <span>BNBUSDT <strong>702</strong> <b className="up">+1.7%</b></span>
      </div>

      <section className="mission-grid">
        <article className="terminal-panel mission-left">
          <header><h3>Mission Control</h3><small>SIGMA Command Center</small></header>
          <div className="kpi-row">
            <div><small>System Overview</small><strong>12</strong><em>6 Active</em></div>
            <div><small>Total Tasks</small><strong>1,467</strong><em>7 Today</em></div>
            <div><small>Operational Uptime</small><strong>98.6%</strong><em>42 days</em></div>
          </div>

          <div className="terminal-panel subpanel">
            <header><h3>Agent Orchestration</h3></header>
            <div className="agent-card-grid">
              {agents.slice(0, 4).map((a) => (
                <div key={a.id} className="agent-card">
                  <div className="agent-art" />
                  <div className="agent-title"><strong>{a.id}</strong><span className={a.status === 'RUNNING' ? 'up' : a.status === 'DEGRADED' ? 'amber' : ''}>{a.status}</span></div>
                  <div className="muted">{a.action}</div>
                  <div className="agent-bars"><span style={{ width: `${Math.max(20, a.health)}%` }} /></div>
                  <div className="agent-actions"><button className="btn compact">Restart</button><button className="btn compact">Pause</button><button className="btn compact">View logs</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="terminal-panel subpanel">
            <header><h3>Event / Log Viewer</h3></header>
            <div className="filters-row">
              <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as any)}>
                <option>ALL</option><option>INFO</option><option>WARN</option><option>ERROR</option>
              </select>
              <button className="btn compact">Newest</button>
              <button className="btn compact">Copy row</button>
            </div>
            <table className="ops-table dense">
              <thead><tr><th>Timestamp</th><th>Agent</th><th>Severity</th><th>Message</th></tr></thead>
              <tbody>
                {filteredLogs.slice(0, 7).map((l, i) => (
                  <tr key={i}><td>{l.ts}</td><td>{l.agent}</td><td className={l.severity === 'ERROR' ? 'down' : l.severity === 'WARN' ? 'amber' : 'up'}>{l.severity}</td><td>{l.message}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="terminal-panel subpanel">
            <header><h3>Audit Log & Two-phase Commit</h3></header>
            <div className="filters-row">
              <input className="input" placeholder="Propose settings change" />
              <button className="btn compact">Propose</button>
              <button className="btn compact">Confirm</button>
            </div>
          </div>
        </article>

        <article className="terminal-panel mission-right">
          <header><h3>Agent Overview</h3></header>
          <div className="overview-block">
            <strong>SigmaX</strong>
            <div className="muted">Regime signal calculations</div>
          </div>
          <div className="overview-tags">
            {['Sigmax', 'SAFE', 'Heart', 'Keysync', 'Atlas RL'].map((t) => <span key={t}>{t}</span>)}
          </div>

          <header><h3>Last 5 Events</h3></header>
          <table className="ops-table dense">
            <thead><tr><th>Event</th><th>Severity</th><th>Latency</th></tr></thead>
            <tbody>
              {['ABSTRACT', 'BINANCE', 'ETCUSDT', 'STCUSDT', 'ETIUSDT'].map((e, i) => (
                <tr key={e}><td>{e}</td><td className={i % 2 ? 'up' : 'amber'}>{i % 2 ? 'SAFE' : 'WARN'}</td><td>1.2s</td></tr>
              ))}
            </tbody>
          </table>

          <header><h3>Performance</h3></header>
          <table className="ops-table dense">
            <thead><tr><th>Agent</th><th>Price</th><th>P/L</th></tr></thead>
            <tbody>
              {agents.slice(0, 5).map((a, i) => (
                <tr key={a.id}><td>{a.id}</td><td>{995.39 + i}</td><td className={i % 2 ? 'down' : 'up'}>{i % 2 ? '-3.51%' : '+3.31%'}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  )
}
