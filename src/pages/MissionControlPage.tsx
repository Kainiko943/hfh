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

  const filteredLogs = useMemo(() => logs.filter((l) => (severity === 'ALL' || l.severity === severity) && l.message.toLowerCase().includes(query.toLowerCase())), [logs, severity, query])

  return (
    <div className="page-grid">
      <CardShell title="System Health Matrix">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {[
            ['Market Data', 'CONNECTED', 'success'], ['Execution', 'PAPER', 'warn'], ['Risk Engine', 'SAFE', 'success'], ['Webhooks', 'DEGRADED', 'warn'], ['Incidents', '2 open', 'error'],
          ].map(([k, v, tone]) => <button key={String(k)} className="btn" onClick={() => setDrawer(String(k))} style={{ textAlign: 'left' }}><div>{k}</div><div style={{ marginTop: 6 }}><StatusPill label={String(v)} tone={tone as any} /></div></button>)}
        </div>
      </CardShell>

      <CardShell title="Agent Orchestration Grid" action={<label><input type="checkbox" checked={devMode} onChange={(e) => setDevMode(e.target.checked)} /> Developer Mode</label>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {agents.map((a) => (
            <div key={a.id} style={{ border: '1px solid rgba(148,163,184,.18)', borderRadius: 12, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{a.id}</strong><StatusPill label={a.status} tone={a.status === 'RUNNING' ? 'success' : a.status === 'DEGRADED' ? 'warn' : 'info'} /></div>
              <div className="muted" style={{ fontSize: 12 }}>Heartbeat {a.heartbeat} • Queue {a.queue}</div>
              <div style={{ marginTop: 4 }}>{a.action}</div>
              <div style={{ height: 8, borderRadius: 6, background: '#111827', marginTop: 8 }}><div style={{ width: `${a.health}%`, height: '100%', borderRadius: 6, background: a.health > 80 ? '#22c55e' : '#f59e0b' }} /></div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {['Restart', 'Pause', 'View logs'].map((c) => <button key={c} className="btn" disabled={!devMode}>{c}</button>)}
              </div>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell title="Event / Log Viewer">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as any)}><option>ALL</option><option>INFO</option><option>WARN</option><option>ERROR</option></select>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs" />
        </div>
        <div style={{ maxHeight: 280, overflow: 'auto' }}>
          {filteredLogs.map((l, i) => <div key={i} style={{ borderLeft: '2px solid rgba(59,130,246,.5)', padding: '8px 10px', marginBottom: 6, background: 'rgba(2,6,23,.35)' }}><small className="muted">{l.ts} • {l.agent} • {l.severity}</small><div>{l.message}</div></div>)}
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
