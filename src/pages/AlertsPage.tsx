import { useMemo, useState, useSyncExternalStore } from 'react'
import { CardShell } from '../components/CardShell'
import { marketStore } from '../state/mockStream'

function SignalCard({ symbol, confidence, side }: { symbol: string; confidence: number; side: 'BUY' | 'SELL' }) {
  const buy = side === 'BUY'
  return (
    <article style={{
      border: '1px solid rgba(148,163,184,.16)', borderRadius: 12, padding: 12,
      background: `linear-gradient(180deg, rgba(30,41,59,.9), ${buy ? 'rgba(34,197,94,.45)' : 'rgba(239,68,68,.45)'})`,
      minHeight: 220,
    }}>
      <div className="muted" style={{ fontSize: 12 }}>{buy ? 'Buy Limit' : 'Sell Limit'}</div>
      <h3 style={{ margin: '8px 0 10px' }}>{symbol}</h3>
      <div style={{ fontSize: 12, lineHeight: 1.7 }}>
        <div>Confidence <strong>{confidence}%</strong></div>
        <div>Entry <strong>{(100 + confidence / 10).toFixed(2)}</strong></div>
        <div>Stop <strong>{(98 + confidence / 11).toFixed(2)}</strong></div>
        <div>Target <strong>{(104 + confidence / 9).toFixed(2)}</strong></div>
      </div>
      <button className="btn" style={{ width: '100%', marginTop: 14, background: 'rgba(255,255,255,.06)' }}>{side}</button>
    </article>
  )
}

export function AlertsPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const [mode, setMode] = useState<'Tabs' | 'List'>('Tabs')
  const [confidenceFilter, setConfidenceFilter] = useState(60)

  const cards = useMemo(() => symbols.slice(0, 10).map((s, i) => ({
    symbol: s.symbol.replace('USDT', ''),
    confidence: Math.max(20, Math.min(95, Math.round(55 + s.change24h * 12 + i * 2))),
    side: (s.change24h >= 0 ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
  })).filter((c) => c.confidence >= confidenceFilter), [symbols, confidenceFilter])

  return (
    <div className="page-grid">
      <CardShell title="Signal Grid" action={<span className="muted">High-confidence alert cards</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 8, marginBottom: 12 }}>
          <button className="btn" onClick={() => setMode('Tabs')} style={{ background: mode === 'Tabs' ? 'rgba(59,130,246,.2)' : undefined }}>Tabs</button>
          <button className="btn" onClick={() => setMode('List')} style={{ background: mode === 'List' ? 'rgba(59,130,246,.2)' : undefined }}>List</button>
          <label className="muted" style={{ alignSelf: 'center' }}>Confidence</label>
          <input type="range" min={0} max={100} value={confidenceFilter} onChange={(e) => setConfidenceFilter(Number(e.target.value))} />
          <div className="muted" style={{ alignSelf: 'center' }}>{confidenceFilter}%</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(180px,1fr))', gap: 10 }}>
          {cards.map((c) => <SignalCard key={c.symbol} symbol={c.symbol} confidence={c.confidence} side={c.side} />)}
        </div>
      </CardShell>
    </div>
  )
}
