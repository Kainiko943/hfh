export function StatusPill({ label, tone = 'info' }: { label: string; tone?: 'success' | 'warn' | 'error' | 'info' }) {
  const color = tone === 'success' ? '#4ade80' : tone === 'warn' ? '#fbbf24' : tone === 'error' ? '#f87171' : '#67e8f9'
  return <span className="pill" style={{ borderColor: color + '66', color }}>{label}</span>
}
