export function Stars({ value = 0, size = 'text-sm' }) {
  return (
    <span className={`${size} tracking-tight text-amber-400`}>
      {'★'.repeat(Math.round(value) || 0)}
      <span className="text-slate-600">{'★'.repeat(5 - (Math.round(value) || 0))}</span>
    </span>
  );
}

export function ScoreRing({ score }) {
  const color = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-300' : 'text-slate-400';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-extrabold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {score}% match
    </span>
  );
}

export function SkillChip({ name, level, tone = 'teach' }) {
  const styles =
    tone === 'teach'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : 'border-sky-400/20 bg-sky-400/10 text-sky-300';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {name}
      {level && <span className="opacity-60">· {level}</span>}
    </span>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-fuchsia-400">{kicker}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">{title}</h2>
      {sub && <p className="mt-3 text-slate-400">{sub}</p>}
    </div>
  );
}
