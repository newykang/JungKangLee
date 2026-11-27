interface Props {
  title: string
  description: string
}

export default function FeaturePlaceholder({ title, description }: Props) {
  return (
    <section className="rounded-3xl border border-indigo-100 bg-indigo-50/40 px-5 py-7 sm:px-8">
      <p className="mb-3 text-sm font-semibold text-indigo-700">준비 중</p>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    </section>
  )
}
