import { useMemo, useState, useSyncExternalStore } from 'react'
import { CardShell } from '../components/CardShell'
import { marketStore } from '../state/mockStream'

type Side = 'BUY' | 'SELL'

function AlertSignalCard({ symbol, confidence, side }: { symbol: string; confidence: number; side: Side }) {
  const tone = side === 'BUY'
  const sideColor = tone ? '#4ade80' : '#fb7185'
  const header = tone ? 'Buy Setup' : 'Sell Setup'

  return (
    <article
      style={{
        border: '1px solid rgba(148,163,184,.2)',
        borderRadius: 12,
        padding: 12,
        minHeight: 224,
        background: `linear-gradient(180deg, rgba(17,24,39,.92) 0%, ${tone ? 'rgba(22,101,52,.36)' : 'rgba(153,27,27,.34)'} 100%)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span className="muted">{header}</span>
        <span style={{ color: sideColor, fontWeight: 600 }}>{side}</span>
      </div>
      <h3 style={{ margin: '8px 0 12px', fontSize: 28, letterSpacing: '.01em' }}>{symbol}</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div className="muted">Confidence</div><strong>{confidence}%</strong>
        <div className="muted">Entry</div><strong>{(100 + confidence / 10).toFixed(2)}</strong>
        <div className="muted">Stop</div><strong>{(98 + confidence / 11).toFixed(2)}</strong>
        <div className="muted">Target</div><strong>{(104 + confidence / 9).toFixed(2)}</strong>
      </div>

      <button className="btn" style={{ width: '100%', marginTop: 16, borderColor: sideColor + '66' }}>{side} SIGNAL</button>
    </article>
  )
}

export function AlertsPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const [viewMode, setViewMode] = useState<'Tabs' | 'List'>('Tabs')
  const [confidenceMin, setConfidenceMin] = useState(50)
  const [assetClass, setAssetClass] = useState('All')
  const [status, setStatus] = useState('All')

  const cards = useMemo(
    () =>
      symbols
        .slice(0, 10)
        .map((s, i) => ({
          symbol: s.symbol.replace('USDT', ''),
          confidence: Math.max(20, Math.min(95, Math.round(56 + s.change24h * 12 + i * 1.8))),
          side: (s.change24h >= 0 ? 'BUY' : 'SELL') as Side,
        }))
        .filter((c) => c.confidence >= confidenceMin),
    [symbols, confidenceMin],
  )

  return (
    <div className="page-grid">
      <CardShell title="Alerts Terminal" action={<span className="muted">Institutional signal surface</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto auto', gap: 8, marginBottom: 12 }}>
          <button className="btn" onClick={() => setViewMode('Tabs')} style={{ background: viewMode === 'Tabs' ? 'rgba(59,130,246,.22)' : undefined }}>Tabs</button>
          <button className="btn" onClick={() => setViewMode('List')} style={{ background: viewMode === 'List' ? 'rgba(59,130,246,.22)' : undefined }}>List</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="muted" style={{ fontSize: 12 }}>Confidence</span>
            <input type="range" min={0} max={100} value={confidenceMin} onChange={(e) => setConfidenceMin(Number(e.target.value))} />
            <strong style={{ minWidth: 46 }}>{confidenceMin}%</strong>
          </div>
          <select className="select" value={assetClass} onChange={(e) => setAssetClass(e.target.value)}><option>All</option><option>FX</option><option>Crypto</option><option>Index</option></select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Live</option><option>Queued</option><option>Closed</option></select>
          <select className="select"><option>English</option></select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(170px,1fr))', gap: 10 }}>
          {cards.map((c) => <AlertSignalCard key={c.symbol} symbol={c.symbol} confidence={c.confidence} side={c.side} />)}
        </div>
      </CardShell>
    </div>
  )
}
