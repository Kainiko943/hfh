import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { StatusPill } from '../components/StatusPill'
import { useEffect, useMemo, useState } from 'react'

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let seq = ''
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOpen((v) => !v); return
      }
      const k = e.key.toLowerCase()
      if ('gdmcas'.includes(k)) {
        seq = (seq + k).slice(-2)
        const map: Record<string, string> = { gd: '/dashboard', gm: '/markets', gc: '/mission-control', ga: '/alerts', gs: '/settings' }
        if (map[seq]) navigate(map[seq])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  const commandItems = useMemo(() => [
    ['Dashboard', '/dashboard'], ['Markets', '/markets'], ['Mission Control', '/mission-control'], ['Alerts', '/alerts'], ['Settings', '/settings'],
  ] as const, [])

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <strong>Northstar Terminal</strong>
            <div className="muted" style={{ fontSize: 12 }}>SIGMA Command Center</div>
          </div>
        </div>
        {commandItems.map(([label, path]) => (
          <NavLink key={path} to={path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{label}</NavLink>
        ))}
      </aside>

      <main className="main">
        <header className="command-bar">
          <div>
            <strong>Global CommandBar</strong>
            <div className="muted" style={{ fontSize: 12 }}>Cmd/Ctrl+K palette • G then D/M/C/A/S jump</div>
          </div>
          <div className="command-right">
            <StatusPill label="Market CONNECTED" tone="success" />
            <StatusPill label="Risk SAFE" tone="success" />
            <StatusPill label="Execution PAPER" tone="warn" />
            <input className="input" placeholder="Search symbols, agents, events" />
          </div>
        </header>
        <Outlet />
      </main>

      {paletteOpen && (
        <div className="drawer-backdrop" onClick={() => setPaletteOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <h3>Command Palette</h3>
            {commandItems.map(([label, path]) => (
              <button key={path} className="btn" style={{ width: '100%', marginBottom: 8 }} onClick={() => { navigate(path); setPaletteOpen(false) }}>
                Go to {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
