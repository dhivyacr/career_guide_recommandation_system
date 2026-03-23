function AnalyticsCard({ title, value, subtitle, icon: Icon, accent = "from-blue-500/30 to-cyan-400/20" }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(8,15,29,0.38)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70`} />
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          {subtitle ? <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{subtitle}</p> : null}
        </div>

        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.18)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default AnalyticsCard;
