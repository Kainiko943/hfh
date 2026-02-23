export type SymbolRow = { symbol: string; price: number; change24h: number; volume: number; regime: 'Bull' | 'Bear' | 'Neutral'; grade: 'A' | 'B' | 'C' }
export type AgentRow = { id: string; status: 'RUNNING' | 'IDLE' | 'DEGRADED'; heartbeat: string; queue: number; action: string; health: number }
export type LogRow = { ts: string; agent: string; severity: 'INFO' | 'WARN' | 'ERROR'; message: string }

const listeners = new Set<() => void>()
const missionListeners = new Set<() => void>()

let markets: SymbolRow[] = [
  ['BTCUSDT', 98420, 1.2, 1200000, 'Bull', 'A'], ['ETHUSDT', 5203, 0.7, 900000, 'Bull', 'A'],
  ['SOLUSDT', 214, -0.4, 510000, 'Neutral', 'B'], ['BNBUSDT', 702, 0.3, 350000, 'Bull', 'B'],
  ['XRPUSDT', 0.83, -0.1, 260000, 'Neutral', 'C'], ['ADAUSDT', 1.1, 2.0, 420000, 'Bull', 'B'],
].map(([symbol, price, change24h, volume, regime, grade]) => ({ symbol, price, change24h, volume, regime, grade } as SymbolRow))

let agents: AgentRow[] = [
  { id: 'SigmaX', status: 'RUNNING', heartbeat: '2s ago', queue: 4, action: 'Signal summary', health: 92 },
  { id: 'Hermes', status: 'IDLE', heartbeat: '5s ago', queue: 1, action: 'Awaiting route', health: 88 },
  { id: 'Chronos', status: 'DEGRADED', heartbeat: '9s ago', queue: 3, action: 'Risk retry', health: 62 },
  { id: 'Orion', status: 'RUNNING', heartbeat: '3s ago', queue: 2, action: 'Regime detect', health: 90 },
  { id: 'Atlas RL', status: 'IDLE', heartbeat: 'N/A', queue: 0, action: 'Not active', health: 70 },
  { id: 'Vault Orchestrator', status: 'RUNNING', heartbeat: '1s ago', queue: 2, action: 'Lineage check', health: 94 },
]

let logs: LogRow[] = [
  { ts: '09:41:12', agent: 'SigmaX', severity: 'INFO', message: 'Published abstract signal update' },
  { ts: '09:41:03', agent: 'Chronos', severity: 'WARN', message: 'Risk check delayed, retry queued' },
]

export const marketStore = {
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  getSnapshot: () => markets,
}
export const missionStore = {
  subscribe(cb: () => void) { missionListeners.add(cb); return () => missionListeners.delete(cb) },
  getAgents: () => agents,
  getLogs: () => logs,
}

function emitMarkets() { listeners.forEach((l) => l()) }
function emitMission() { missionListeners.forEach((l) => l()) }

setInterval(() => {
  const idx = Math.floor(Math.random() * markets.length)
  const row = markets[idx]
  const delta = (Math.random() - 0.5) * (row.price * 0.0015)
  const updated = { ...row, price: +(row.price + delta).toFixed(row.price > 5 ? 2 : 4), change24h: +(row.change24h + (Math.random() - .5) * 0.08).toFixed(2) }
  markets = markets.map((r, i) => (i === idx ? updated : r))
  emitMarkets()
}, 1000)

setInterval(() => {
  const aIdx = Math.floor(Math.random() * agents.length)
  agents = agents.map((a, i) => i === aIdx ? { ...a, queue: Math.max(0, a.queue + (Math.random() > .5 ? 1 : -1)), heartbeat: 'just now' } : a)
  const agent = agents[aIdx]
  const sev: LogRow['severity'] = agent.status === 'DEGRADED' ? 'WARN' : 'INFO'
  logs = [{ ts: new Date().toLocaleTimeString(), agent: agent.id, severity: sev, message: `${agent.action} heartbeat` }, ...logs].slice(0, 300)
  emitMission()
}, 1500)
