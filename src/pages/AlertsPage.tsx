import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowUpDown, Search } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { marketStore } from '../state/mockStream'

type Side = 'BUY' | 'SELL'
type SortKey = 'symbol' | 'side' | 'confidence' | 'entry' | 'stop' | 'target' | 'performance' | 'regime' | 'grade' | 'source'

type SignalRow = {
  symbol: string
  agent: string
  side: Side
  confidence: number
  entry: number
  stop: number
  target: number
  rr: number
  performance: number
  regime: string
  grade: string
  source: string
  timeframe: '5m' | '15m' | '1h' | '4h'
  assetClass: 'Crypto' | 'FX' | 'Index'
  pair: string
  language: 'English' | 'Deutsch' | 'Español'
  spark: Array<{ t: number; v: number }>
}

const SOURCES = ['SigmaX', 'Chronos', 'Orion', 'Hermes'] as const
const SIGNALS = ['ABSTRACT', 'RANGE', 'VOLATILITY', 'KEYNES'] as const

function toSignalRows(markets: ReturnType<typeof marketStore.getSnapshot>): SignalRow[] {
  return markets.map((m, idx) => {
    const side: Side = m.change24h >= 0 ? 'BUY' : 'SELL'
    const confidence = Math.max(38, Math.min(95, Math.round(57 + m.change24h * 9 + idx * 2.4)))
    const entry = Number((m.price * 0.998).toFixed(m.price > 10 ? 2 : 4))
    const stop = Number((entry * (side === 'BUY' ? 0.985 : 1.015)).toFixed(m.price > 10 ? 2 : 4))
    const target = Number((entry * (side === 'BUY' ? 1.022 : 0.978)).toFixed(m.price > 10 ? 2 : 4))
    const rr = Number((Math.abs(target - entry) / Math.abs(entry - stop)).toFixed(2))
    const performance = Number((m.change24h * 2.3 + (idx % 2 ? -0.4 : 0.8)).toFixed(2))

    return {
      symbol: m.symbol,
      agent: SOURCES[idx % SOURCES.length],
      side,
      confidence,
      entry,
      stop,
      target,
      rr,
      performance,
      regime: m.regime,
      grade: m.grade,
      source: SIGNALS[idx % SIGNALS.length],
      timeframe: (['5m', '15m', '1h', '4h'] as const)[idx % 4],
      assetClass: 'Crypto',
      pair: m.symbol,
      language: 'English',
      spark: Array.from({ length: 18 }).map((_, i) => ({ t: i, v: m.price * (1 + ((i - 9) * 0.0006 + m.change24h * 0.0001)) })),
    }
  })
}

const SignalCard = memo(function SignalCard({ signal }: { signal: SignalRow }) {
  const sideClass = signal.side === 'BUY' ? 'buy' : 'sell'

  return (
    <article className={`signal-card ${sideClass}`}>
      <div className="signal-card-head">
        <strong>{signal.symbol.replace('USDT', '')}</strong>
        <span>{signal.agent}</span>
        <em className={`side-badge ${sideClass}`}>{signal.side}</em>
      </div>

      <div className="signal-mid-row">
        <div>
          <div className="signal-label">CONFIDENCE</div>
          <div className="signal-confidence">{signal.confidence}%</div>
        </div>
        <div className="signal-mini-chart" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signal.spark}>
              <Line type="monotone" dataKey="v" stroke={signal.side === 'BUY' ? '#00FF6A' : '#FF3B3B'} strokeWidth={1.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="trade-grid">
        <span>Entry</span><strong>{signal.entry}</strong>
        <span>Stop</span><strong>{signal.stop}</strong>
        <span>Target</span><strong>{signal.target}</strong>
        <span>R/R</span><strong>{signal.rr}</strong>
      </div>

      <button className={`signal-cta ${sideClass}`}>{signal.side} SIGNAL</button>
    </article>
  )
})

const ScannerRow = memo(function ScannerRow({
  row,
  flash,
}: {
  row: SignalRow
  flash: Partial<Record<'confidence' | 'entry' | 'performance', boolean>>
}) {
  return (
    <tr>
      <td>{row.symbol}</td>
      <td><span className={row.side === 'BUY' ? 'up' : 'down'}>{row.side}</span></td>
      <td className={flash.confidence ? 'flash' : ''}>{row.confidence}%</td>
      <td className={flash.entry ? 'flash' : ''}>{row.entry}</td>
      <td>{row.stop}</td>
      <td>{row.target}</td>
      <td className={`${row.performance >= 0 ? 'up' : 'down'} ${flash.performance ? 'flash' : ''}`}>{row.performance}%</td>
      <td>{row.regime}</td>
      <td>{row.grade}</td>
      <td>{row.source}</td>
    </tr>
  )
})

export function AlertsPage() {
  const markets = useSyncExternalStore(marketStore.subscribe, marketStore.getSnapshot)
  const [view, setView] = useState<'Tabs' | 'List'>('Tabs')
  const [confidenceMin, setConfidenceMin] = useState(50)
  const [timeframe, setTimeframe] = useState<'All' | SignalRow['timeframe']>('All')
  const [assetClass, setAssetClass] = useState<'All' | SignalRow['assetClass']>('All')
  const [pair, setPair] = useState<'All' | string>('All')
  const [language, setLanguage] = useState<'All' | SignalRow['language']>('All')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('confidence')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const prevRef = useRef<Record<string, Pick<SignalRow, 'confidence' | 'entry' | 'performance'>>>({})
  const [flashes, setFlashes] = useState<Record<string, Partial<Record<'confidence' | 'entry' | 'performance', boolean>>>>({})

  const allSignals = useMemo(() => toSignalRows(markets), [markets])

  useEffect(() => {
    const changed: Record<string, Partial<Record<'confidence' | 'entry' | 'performance', boolean>>> = {}
    for (const s of allSignals) {
      const prev = prevRef.current[s.symbol]
      if (!prev) {
        prevRef.current[s.symbol] = { confidence: s.confidence, entry: s.entry, performance: s.performance }
        continue
      }
      const entry: Partial<Record<'confidence' | 'entry' | 'performance', boolean>> = {}
      if (prev.confidence !== s.confidence) entry.confidence = true
      if (prev.entry !== s.entry) entry.entry = true
      if (prev.performance !== s.performance) entry.performance = true
      if (Object.keys(entry).length > 0) changed[s.symbol] = entry
      prevRef.current[s.symbol] = { confidence: s.confidence, entry: s.entry, performance: s.performance }
    }

    if (Object.keys(changed).length === 0) return
    setFlashes((old) => ({ ...old, ...changed }))
    const timeout = window.setTimeout(() => {
      setFlashes((old) => {
        const next = { ...old }
        Object.keys(changed).forEach((k) => delete next[k])
        return next
      })
    }, 200)
    return () => window.clearTimeout(timeout)
  }, [allSignals])

  const filtered = useMemo(() => {
    const list = allSignals.filter((s) =>
      s.confidence >= confidenceMin &&
      (timeframe === 'All' || s.timeframe === timeframe) &&
      (assetClass === 'All' || s.assetClass === assetClass) &&
      (pair === 'All' || s.pair === pair) &&
      (language === 'All' || s.language === language) &&
      s.symbol.toLowerCase().includes(query.toLowerCase()),
    )

    const sorted = [...list].sort((a, b) => {
      const av = a[sortBy]
      const bv = b[sortBy]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

    return sorted
  }, [allSignals, confidenceMin, timeframe, assetClass, pair, language, query, sortBy, sortDir])

  const topCards = filtered.slice(0, 8)

  const toggleSort = (key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('desc')
      return key
    })
  }

  return (
    <div className="alerts-page page-grid">
      <section className="alerts-controls terminal-panel">
        <div className="controls-left">
          <div className="tabs-toggle">
            <button className={`btn compact ${view === 'Tabs' ? 'active' : ''}`} onClick={() => setView('Tabs')}>Tabs</button>
            <button className={`btn compact ${view === 'List' ? 'active' : ''}`} onClick={() => setView('List')}>List</button>
          </div>

          <div className="confidence-filter">
            <span>Confidence</span>
            <input type="range" min={0} max={100} value={confidenceMin} onChange={(e) => setConfidenceMin(Number(e.target.value))} />
            <strong>{confidenceMin}%</strong>
          </div>

          <select className="select" value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)}>
            <option value="All">All timeframes</option>
            <option value="5m">5m</option><option value="15m">15m</option><option value="1h">1h</option><option value="4h">4h</option>
          </select>
          <select className="select" value={assetClass} onChange={(e) => setAssetClass(e.target.value as any)}>
            <option value="All">All assets</option><option value="Crypto">Crypto</option><option value="FX">FX</option><option value="Index">Index</option>
          </select>
          <select className="select" value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="All">All pairs</option>{allSignals.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
          </select>
          <select className="select" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
            <option value="All">All languages</option><option value="English">English</option><option value="Deutsch">Deutsch</option><option value="Español">Español</option>
          </select>
        </div>

        <div className="controls-right">
          <Search size={14} />
          <input className="input" placeholder="Search symbols..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      <section className="alerts-surface">
        <header><h3>Institutional Signal Surface</h3></header>
        <div className="signal-grid">
          {topCards.map((signal) => <SignalCard key={signal.symbol} signal={signal} />)}
        </div>
      </section>

      <section className="terminal-panel">
        <header className="scanner-header">
          <h3>Signal Scanner</h3>
          <span>{filtered.length} rows</span>
        </header>

        <div className="scanner-wrap">
          <table className="ops-table dense scanner-table">
            <thead>
              <tr>
                {([
                  ['symbol', 'Symbol'], ['side', 'Side'], ['confidence', 'Confidence'], ['entry', 'Entry'], ['stop', 'Stop'], ['target', 'Target'], ['performance', 'Performance'],
                  ['regime', 'Regime'], ['grade', 'Grade'], ['source', 'Signal Source'],
                ] as Array<[SortKey, string]>).map(([key, label]) => (
                  <th key={key}>
                    <button className="sort-btn" onClick={() => toggleSort(key)}>
                      {label} <ArrowUpDown size={11} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <ScannerRow key={row.symbol} row={row} flash={flashes[row.symbol] ?? {}} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="terminal-panel audit-panel">
        <div className="audit-top">
          <div>
            <span>Propose change</span>
            <input className="input" placeholder="Propose queue / two-phase commit" />
          </div>
          <div className="audit-actions">
            <button className="btn compact">Propose</button>
            <button className="btn compact">Confirm</button>
          </div>
        </div>
        <div className="audit-logline">19:47:52 | Admin | Updated settings config (mock) | confirmed</div>
      </section>
    </div>
  )
}
