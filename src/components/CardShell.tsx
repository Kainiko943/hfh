import type { PropsWithChildren, ReactNode } from 'react'

export function CardShell({ children, title, action }: PropsWithChildren<{ title?: string; action?: ReactNode }>) {
  return (
    <section className="card">
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
