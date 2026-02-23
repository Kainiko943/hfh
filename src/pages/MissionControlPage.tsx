import { useMemo, useState, useSyncExternalStore } from 'react'
import { CardShell } from '../components/CardShell'
import { Drawer } from '../components/Drawer'
import { StatusPill } from '../components/StatusPill'
import { missionStore } from '../state/mockStream'

export function MissionControlPage() {
  const agents = useSyncExternalStore(missionStore.subscribe, missionStore.getAgents)
  const logs = useSyncExternalStore(missionStore.subscribe, missionStore.getLogs)
  const [drawer, setDrawer] = useState<string | null>(null)
  const [devMode, setDevMode] = useState(false)
  const [severity, setSeverity] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [query, setQuery] = useState('')

  const filteredLogs = useMemo(
    () => logs.filter((l) => (severity === 'ALL' || l.severity === severity) && l.message.toLowerCase().includes(query.toLowerCase())),
    [logs, severity, query],
  )

  const counts = {
    active: agents.filter((a) => a.status === 'RUNNING').length,
    warn: agents.filter((a) => a.status === 'DEGRADED').length,
    idle: agents.filter((a) => a.status === 'IDLE').length,
  }

  return (
    <div className="page-grid">
      <div style={{ display: 'grid', gridTemplateColumns: '260px repeat(3, 1fr)', gap: 12 }}>
        <CardShell title="Active Agents">
          {agents.slice(0, 6).map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <strong style={{ fontSize: 13 }}>{a.id}</strong>
                <div className="muted" style={{ fontSize: 12 }}>{a.action}</div>
              </div>
              <span style={{ width: 10, height: 10, marginTop: 6, borderRadius: 99, background: a.status === 'RUNNING' ? '#84cc16' : a.status === 'DEGRADED' ? '#f59e0b' : '#64748b' }} />
            </div>
          ))}
        </CardShell>

        <CardShell title="Total Agents"><div style={{ fontSize: 46, fontWeight: 700 }}>12</div><div className="muted">{Math.round((counts.active / 6) * 100)}% active</div></CardShell>
        <CardShell title="Tasks Completed"><div style={{ fontSize: 46, fontWeight: 700 }}>1,458</div><div className="muted">12% today</div></CardShell>
        <CardShell title="Uptime"><div style={{ fontSize: 46, fontWeight: 700 }}>98.7%</div><div className="muted">42 days stable</div></CardShell>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 12 }}>
        <CardShell title="Agent Performance">
          <div style={{ height: 240, borderRadius: 12, border: '1px solid rgba(148,163,184,.16)', background: 'linear-gradient(180deg, rgba(168,85,247,.14), rgba(15,23,42,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Trend lines (Accuracy / Processing Throughput)
          </div>

          <CardShell title="System Health Matrix">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
              {[
                ['Market Data', 'CONNECTED', 'success'], ['Execution', 'PAPER', 'warn'], ['Risk Engine', 'SAFE', 'success'], ['Webhooks', 'DEGRADED', 'warn'], ['Incidents', '2 open', 'error'],
              ].map(([k, v, tone]) => (
                <button key={String(k)} className="btn" onClick={() => setDrawer(String(k))} style={{ textAlign: 'left' }}>
                  <div>{k}</div>
                  <div style={{ marginTop: 6 }}><StatusPill label={String(v)} tone={tone as any} /></div>
                </button>
              ))}
            </div>
          </CardShell>
        </CardShell>

        <div style={{ display: 'grid', gap: 12 }}>
          <CardShell title="Agent Status">
            <div style={{ display: 'grid', gap: 8 }}>
              <div><span style={{ color: '#84cc16' }}>●</span> Active: {counts.active}</div>
              <div><span style={{ color: '#f59e0b' }}>●</span> Warning: {counts.warn}</div>
              <div><span style={{ color: '#64748b' }}>●</span> Idle: {counts.idle}</div>
            </div>
          </CardShell>

          <CardShell title="Quick Actions" action={<label><input type="checkbox" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} /> Developer Mode</label>}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Restart', 'Pause', 'View logs'].map((c) => <button key={c} className="btn" disabled={!devMode}>{c}</button>)}
            </div>
            <div className="muted" style={{ marginTop: 8 }}>Controls stay disabled unless Developer Mode is enabled.</div>
          </CardShell>
        </div>
      </div>

      <CardShell title="Event / Log Viewer">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as any)}><option>ALL</option><option>INFO</option><option>WARN</option><option>ERROR</option></select>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs" />
          <button className="btn">Newest on top</button>
        </div>
        <div style={{ maxHeight: 260, overflow: 'auto' }}>
          {filteredLogs.map((l, i) => (
            <div key={i} style={{ borderLeft: '2px solid rgba(59,130,246,.5)', padding: '8px 10px', marginBottom: 6, background: 'rgba(2,6,23,.35)' }}>
              <small className="muted">{l.ts} • {l.agent} • {l.severity}</small>
              <div>{l.message}</div>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell title="Audit + Two-phase Commit">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
          <input className="input" placeholder="Propose change (mock)" />
          <button className="btn">Propose</button>
          <button className="btn">Confirm</button>
        </div>
        <p className="muted">Secrets stay masked. Reveal requires warning acknowledgement.</p>
      </CardShell>

      <Drawer open={Boolean(drawer)} onClose={() => setDrawer(null)} title={`${drawer} Details`}>
        <p className="muted">Expanded health diagnostics drawer for {drawer}.</p>
      </Drawer>
    </div>
  )
}
