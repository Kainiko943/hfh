import { useMemo, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { CardShell } from '../components/CardShell'
import { Metric } from '../components/Metric'
import { Sparkline } from '../components/Sparkline'
import { marketStore, missionStore } from '../state/mockStream'

export function DashboardPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const agents = useSyncExternalStore(missionStore.subscribe, missionStore.getAgents)
  const logs = useSyncExternalStore(missionStore.subscribe, missionStore.getLogs)

  const top = symbols.slice(0, 4)
  const spark = useMemo(() => top.map((s) => s.price), [top])

  return (
    <div className="page-grid dashboard-premium">
      <div className="ticker">
        <div className="ticker-track">
          {symbols.concat(symbols).map((s, i) => (
            <span key={s.symbol + i}>
              {s.symbol} <strong>{s.price}</strong>{' '}
              <span style={{ color: s.change24h >= 0 ? '#4ade80' : '#fb7185' }}>{s.change24h}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="dashboard-grid-top">
        <CardShell title="Executive Market Overview" action={<Link to="/markets" className="ghost-link">Open Markets →</Link>}>
          <div className="header-divider" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {top.map((s) => (
              <Metric
                key={s.symbol}
                label={s.symbol}
                value={`${s.price}`}
                accent={s.change24h >= 0 ? '#4ade80' : '#fb7185'}
              />
            ))}
          </div>

          <div className="market-overview-foot">
            <div className="sparkline-shimmer">
              <Sparkline values={spark} color="#57c2ff" />
              <span className="shimmer-overlay" />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              {top.slice(0, 2).map((s) => (
                <div key={`${s.symbol}-${s.price}`} className="price-pulse-box">
                  <span className="muted" style={{ fontSize: 12 }}>{s.symbol}</span>
                  <strong className="price-pulse" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 24 }}>{s.price}</strong>
                </div>
              ))}
            </div>
          </div>
        </CardShell>

        <CardShell title="Mission Control Health" action={<Link to="/mission-control" className="ghost-link">Open Ops →</Link>}>
          <div className="header-divider" />
          <div className="health-pill-grid">
            <div className="health-pill connected">Market Data CONNECTED</div>
            <div className="health-pill safe">Risk SAFE</div>
            <div className="health-pill paper">Execution PAPER</div>
            <div className="health-pill degraded">Webhooks DEGRADED</div>
          </div>
        </CardShell>
      </div>

      <div className="dashboard-grid-bottom">
        <CardShell title="Agent Grid Preview" action={<Link to="/mission-control" className="ghost-link">Full orchestration →</Link>}>
          <div className="header-divider" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {agents.slice(0, 6).map((a) => (
              <div key={a.id} className={`agent-mini ${a.status === 'RUNNING' ? 'is-active' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{a.id}</strong>
                  <span className={`dot ${a.status === 'RUNNING' ? 'green' : a.status === 'DEGRADED' ? 'amber' : 'slate'}`} />
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{a.action}</div>
                {a.status === 'RUNNING' && <div className="agent-shimmer" />}
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell title="Event Timeline Preview" action={<Link to="/mission-control" className="ghost-link">Open log viewer →</Link>}>
          <div className="header-divider" />
          <div className="timeline-premium">
            {logs.slice(0, 10).map((l, i) => (
              <div key={`${l.ts}-${i}`} className="timeline-event premium-in">
                <small>{l.ts} • {l.agent}</small>
                <div>{l.message}</div>
              </div>
            ))}
          </div>
        </CardShell>
      </div>
    </div>
  )
}
