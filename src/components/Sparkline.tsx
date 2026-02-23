export function Sparkline({ values, color = '#22d3ee' }: { values: number[]; color?: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 118},${30 - ((v - min) / (max - min || 1)) * 24}`).join(' ')
  return (
    <svg className="spark" viewBox="0 0 120 34" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}
