export function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: 'rgba(15,23,42,.7)', border: '1px solid rgba(148,163,184,.14)', borderRadius: 12, padding: 10 }}>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, marginTop: 4, color: accent }}>{value}</div>
    </div>
  )
}
