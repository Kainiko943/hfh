import type { ReactNode } from 'react'

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode }) {
  return (
    <table className="table">
      <thead>
        <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}
