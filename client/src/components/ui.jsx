export function SwapMark({ className = '' }) {
  // The signature detail: the two-way swap arrow, one solid stroke.
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 3.5 1.5 7 5 10.5M1.5 7h10M15 9.5 18.5 13 15 16.5M18.5 13h-10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({ value = 0, size = 'text-sm' }) {
  return (
    <span className={`${size} tracking-tight text-amber-500`} aria-label={`${value} out of 5`}>
      {'★'.repeat(Math.round(value) || 0)}
      <span className="text-ink-3/60">{'★'.repeat(5 - (Math.round(value) || 0))}</span>
    </span>
  );
}

export function ScoreRing({ score }) {
  const color = score >= 80 ? 'text-positive' : score >= 50 ? 'text-amber-600' : 'text-ink-3';
  return (
    <span className={`mono inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {score}% match
    </span>
  );
}

export function SkillChip({ name, level, tone = 'teach' }) {
  const styles = tone === 'teach' ? 'text-positive' : 'text-sky-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-hairline bg-raised px-2 py-1 text-xs font-medium ${styles}`}>
      {name}
      {level && <span className="text-ink-3 opacity-80">· {level}</span>}
    </span>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-3 text-3xl font-medium tracking-tight text-ink">{title}</h2>
      {sub && <p className="mt-3 text-ink-2">{sub}</p>}
    </div>
  );
}
