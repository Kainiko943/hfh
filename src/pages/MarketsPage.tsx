import { useMemo, useState, useSyncExternalStore } from 'react'
import { marketStore } from '../state/mockStream'

const tabs = ['Watchlist', 'Top Movers', 'Top Volume'] as const

export function MarketsPage() {
  const symbols = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Watchlist')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(symbols[0]?.symbol ?? 'BTCUSDT')

  const filtered = useMemo(() => symbols.filter((s) => s.symbol.toLowerCase().includes(query.toLowerCase())), [symbols, query])
  const selected = symbols.find((s) => s.symbol === active) ?? symbols[0]

  return (
    <div className="markets-terminal page-grid">
      <div className="terminal-ticker-row">
        {symbols.slice(0, 8).map((s) => (
          <span key={s.symbol}>
            {s.symbol} <strong>{s.price}</strong> <b className={s.change24h >= 0 ? 'up' : 'down'}>{s.change24h}%</b>
          </span>
        ))}
      </div>

      <section className="markets-grid">
        <article className="terminal-panel watch-panel">
          <header><h3>Markets</h3><small>SIGMA Command Center</small></header>
          <div className="tab-row">
            {tabs.map((t) => (
              <button key={t} className={`btn compact ${t === tab ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <input className="input" placeholder="Search watchlist" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="watch-list">
            {filtered.map((s) => (
              <button key={s.symbol} className={`watch-row ${s.symbol === active ? 'active' : ''}`} onClick={() => setActive(s.symbol)}>
                <span>{s.symbol}</span>
                <strong>{s.price}</strong>
                <em className={s.change24h >= 0 ? 'up' : 'down'}>{s.change24h}%</em>
              </button>
            ))}
          </div>
        </article>

        <article className="terminal-panel chart-panel">
          <header>
            <h3>Advanced Chart Workstation — {selected?.symbol}</h3>
          </header>
          <div className="chart-top-controls">
            {['1m', '5m', '15m', '1h', '4h', '1D'].map((t) => <button key={t} className="btn compact">{t}</button>)}
            {['MA/EMA', 'VWAP', 'Volume'].map((i) => <label key={i}><input type="checkbox" defaultChecked /> {i}</label>)}
          </div>
          <div className="chart-canvas">
            <div className="chart-gridline" />
            <div className="candles-mock">{Array.from({ length: 56 }).map((_, i) => <span key={i} className={`mk-candle ${i % 6 === 0 ? 'down' : 'up'}`} />)}</div>
          </div>
          <div className="chart-stats-row">
            {[
              ['Last', selected?.price], ['Spread', '1.7 / 0.01%'], ['24h%', `${selected?.change24h}%`], ['Volume', selected?.volume], ['Regime', selected?.regime], ['Signal', selected?.grade],
            ].map(([k, v]) => <div key={String(k)}><small>{k}</small><strong>{v}</strong></div>)}
          </div>

          <div className="terminal-panel subpanel">
            <header><h3>Trading Performance</h3></header>
            <table className="ops-table dense">
              <thead><tr><th>Symbol</th><th>Side</th><th>Status</th><th>Avg Price</th><th>P/L%</th><th>Close Time</th></tr></thead>
              <tbody>
                {filtered.slice(0, 6).map((s, i) => (
                  <tr key={s.symbol + i}>
                    <td>{s.symbol}</td><td className="up">Long</td><td>Closed</td><td>{s.price}</td><td className={i % 2 ? 'down' : 'up'}>{i % 2 ? '-1.26%' : '+1.97%'}</td><td>19:47:42</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="terminal-panel micro-panel">
          <header><h3>Order Book</h3></header>
          <table className="ops-table dense">
            <thead><tr><th>Symbol</th><th>Bid</th><th>Ask</th><th>Vol</th></tr></thead>
            <tbody>
              {filtered.slice(0, 5).map((s, i) => (
                <tr key={s.symbol}><td>{s.symbol}</td><td className="up">{(s.price - (i * 0.2)).toFixed(2)}</td><td className="down">{(s.price + (i * 0.2)).toFixed(2)}</td><td>{Math.round(s.volume / 1000)}k</td></tr>
              ))}
            </tbody>
          </table>
          <header><h3>Recent Trades</h3></header>
          <table className="ops-table dense">
            <thead><tr><th>Time</th><th>Price</th><th>Qty</th><th>Side</th><th>P/L</th></tr></thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td>17:{30 + i}</td><td>{selected?.price}</td><td>{400 + i * 30}</td><td>{i % 2 ? 'Buy' : 'Sell'}</td><td className={i % 2 ? 'up' : 'down'}>{i % 2 ? '6.5%' : '-3.6%'}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  )
}
