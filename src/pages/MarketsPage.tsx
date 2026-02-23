import { memo, useMemo, useState, useSyncExternalStore } from 'react'
import { CardShell } from '../components/CardShell'
import { DataTable } from '../components/DataTable'
import { Drawer } from '../components/Drawer'
import { marketStore } from '../state/mockStream'

const tabs = ['Watchlist', 'Top Movers', 'Top Volume'] as const

const ScreenerRow = memo(function ScreenerRow({ row, onClick }: { row: any; onClick: () => void }) {
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>{row.symbol}</td><td>{row.price}</td><td style={{ color: row.change24h >= 0 ? '#4ade80' : '#fb7185' }}>{row.change24h}%</td><td>{row.volume}</td><td>{row.regime}</td><td>{row.grade}</td>
    </tr>
  )
})

export function MarketsPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Watchlist')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(symbols[0]?.symbol ?? 'BTCUSDT')
  const [drawer, setDrawer] = useState(false)

  const filtered = useMemo(() => symbols.filter((s) => s.symbol.toLowerCase().includes(query.toLowerCase())), [symbols, query])
  const selected = symbols.find((s) => s.symbol === active) ?? symbols[0]

  return (
    <div className="page-grid">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', gap: 14 }}>
        <CardShell title="Watchlists + Movers">
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>{tabs.map((t) => <button key={t} className="btn" style={{ background: t === tab ? 'rgba(59,130,246,.2)' : undefined }} onClick={() => setTab(t)}>{t}</button>)}</div>
          <input className="input" placeholder="Search watchlist" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
          <div style={{ maxHeight: 420, overflow: 'auto' }}>{filtered.map((s) => <div key={s.symbol} onClick={() => setActive(s.symbol)} style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(148,163,184,.1)', marginBottom: 6, background: s.symbol === active ? 'rgba(59,130,246,.18)' : 'transparent', cursor: 'pointer' }}><strong>{s.symbol}</strong><div className="muted">{s.price} • {s.change24h}%</div></div>)}</div>
        </CardShell>

        <CardShell title={`Advanced Chart Workstation — ${selected?.symbol ?? ''}`}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{['1m','5m','15m','1h','4h','1D'].map((t) => <button key={t} className="btn">{t}</button>)}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{['MA/EMA','VWAP','Volume'].map((i) => <label key={i}><input type="checkbox" defaultChecked /> {i}</label>)}</div>
          <div style={{ height: 320, borderRadius: 12, border: '1px solid rgba(148,163,184,.12)', background: 'linear-gradient(180deg, rgba(34,211,238,.09), rgba(8,47,73,.03))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Crosshair • Zoom • Range • Compare symbol</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginTop: 10 }}>{[
            ['Last', selected?.price], ['24h%', `${selected?.change24h}%`], ['Vol', selected?.volume], ['Funding', '0.01%'], ['Regime', selected?.regime], ['Grade', selected?.grade],
          ].map(([k,v]) => <div key={String(k)} style={{ border: '1px solid rgba(148,163,184,.12)', borderRadius: 10, padding: 8 }}><div className="muted" style={{ fontSize: 12 }}>{k}</div><strong>{v}</strong></div>)}</div>
        </CardShell>

        <CardShell title="Microstructure + Tape">
          <h4 style={{ margin: '0 0 6px' }}>Order Book</h4>
          <div style={{ maxHeight: 170, overflow: 'auto', marginBottom: 10 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#4ade80' }}>{(selected?.price ?? 100) - i * 0.2}</span><span style={{ color: '#fb7185', textAlign: 'right' }}>{(selected?.price ?? 100) + i * 0.2}</span></div>)}</div>
          <h4 style={{ margin: '0 0 6px' }}>Trades Tape</h4>
          <div style={{ maxHeight: 120, overflow: 'auto', marginBottom: 10 }}>{Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ color: i % 2 ? '#4ade80' : '#fb7185', fontSize: 12 }}>{new Date().toLocaleTimeString()} • {selected?.symbol} • {(selected?.price ?? 100) + (i - 6) * 0.05}</div>)}</div>
          <h4 style={{ margin: '0 0 6px' }}>Related News</h4>
          <div className="muted" style={{ fontSize: 13 }}>Macro prints mixed; volatility elevated near session open.</div>
        </CardShell>
      </div>

      <CardShell title="Screener Table">
        <DataTable columns={['Symbol', 'Price', '24h%', 'Vol', 'Trend/Regime', 'Signal Grade']} rows={filtered.map((s) => <ScreenerRow key={s.symbol} row={s} onClick={() => { setActive(s.symbol); setDrawer(true) }} />)} />
      </CardShell>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={`${active} Symbol Drawer`}>
        <p className="muted">Details and quick actions for {active}. Real-time pulses update changed rows only.</p>
        <button className="btn">Open full chart</button>
        <button className="btn" style={{ marginLeft: 8 }}>Add to alerts</button>
      </Drawer>
    </div>
  )
}
