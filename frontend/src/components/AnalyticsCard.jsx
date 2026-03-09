function AnalyticsCard({ title, value, subtitle }) {
  return (
    <article className="glow-card p-4">
      <p className="text-sm text-ai-text/70">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-ai-text/60">{subtitle}</p> : null}
    </article>
  );
}

export default AnalyticsCard;
