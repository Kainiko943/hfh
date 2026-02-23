export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="card"><h3 style={{ marginTop: 0 }}>{title}</h3><p className="muted">{subtitle}</p></div>
}
