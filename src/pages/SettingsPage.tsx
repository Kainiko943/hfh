import { CardShell } from '../components/CardShell'

export function SettingsPage() {
  return (
    <div className="page-grid">
      <CardShell title="Global Settings">
        <p className="muted">Provider/model config controls live here, separate from Markets and Mission Control layouts.</p>
      </CardShell>
    </div>
  )
}
