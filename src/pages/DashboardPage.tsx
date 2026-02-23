import { useMemo, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { CardShell } from '../components/CardShell'
import { Metric } from '../components/Metric'
import { Sparkline } from '../components/Sparkline'
import { StatusPill } from '../components/StatusPill'
import { marketStore, missionStore } from '../state/mockStream'

export function DashboardPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const agents = useSyncExternalStore(missionStore.subscribe, missionStore.getAgents)
  const logs = useSyncExternalStore(missionStore.subscribe, missionStore.getLogs)

  const top = symbols.slice(0, 4)
  const spark = useMemo(() => top.map((s) => s.price), [top])

  return (
    <div className="page-grid">
      <div className="ticker"><div className="ticker-track">{symbols.concat(symbols).map((s, i) => <span key={s.symbol + i}>{s.symbol} <strong>{s.price}</strong> <span style={{ color: s.change24h >= 0 ? '#4ade80' : '#fb7185' }}>{s.change24h}%</span></span>)}</div></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        <CardShell title="Executive Market Overview" action={<Link to="/markets" className="muted">Open Markets →</Link>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {top.map((s) => <Metric key={s.symbol} label={s.symbol} value={`${s.price}`} accent={s.change24h >= 0 ? '#4ade80' : '#fb7185'} />)}
          </div>
          <div style={{ marginTop: 10 }}><Sparkline values={spark} /></div>
        </CardShell>

        <CardShell title="Mission Control Health" action={<Link to="/mission-control" className="muted">Open Ops →</Link>}>
          <div style={{ display: 'grid', gap: 8 }}>
            <StatusPill label="Market Data CONNECTED" tone="success" />
            <StatusPill label="Risk SAFE" tone="success" />
            <StatusPill label="Execution PAPER" tone="warn" />
            <StatusPill label="Webhooks DEGRADED" tone="warn" />
          </div>
        </CardShell>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <CardShell title="Agent Grid Preview" action={<Link to="/mission-control" className="muted">Full orchestration →</Link>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {agents.slice(0, 6).map((a) => <div key={a.id} style={{ border: '1px solid rgba(148,163,184,.15)', borderRadius: 10, padding: 8 }}><strong>{a.id}</strong><div className="muted" style={{ fontSize: 12 }}>{a.action}</div></div>)}
          </div>
        </CardShell>

        <CardShell title="Event Timeline Preview" action={<Link to="/mission-control" className="muted">Open log viewer →</Link>}>
          {logs.slice(0, 10).map((l, i) => <div key={i} style={{ borderLeft: '2px solid rgba(59,130,246,.4)', paddingLeft: 8, marginBottom: 6 }}><small className="muted">{l.ts} • {l.agent}</small><div>{l.message}</div></div>)}
        </CardShell>
      </div>
    </div>
  )
}
