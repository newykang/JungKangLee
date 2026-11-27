import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type ChartRow = { version: string; likes: number; dislikes: number }

export default function VersionChart({ rows }: { rows: ChartRow[] }) {
  if (rows.length === 0) return null

  return (
    <section aria-labelledby="version-chart-title" className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <h2 id="version-chart-title" className="text-base font-bold text-slate-900">버전별 평가</h2>
      <ul className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-slate-700">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-sm bg-indigo-600" />좋아요</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-sm bg-slate-500" />싫어요</li>
      </ul>
      <div aria-hidden="true" className="mt-4 h-52 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={rows} margin={{ top: 8, right: 14, bottom: 0, left: 0 }} accessibilityLayer={false}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="version" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} />
            <YAxis domain={[0, 1]} ticks={[0, 1]} width={24} allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
            <Tooltip />
            <Bar name="좋아요" dataKey="likes" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            <Bar name="싫어요" dataKey="dislikes" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
