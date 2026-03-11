import { FiPlayCircle } from "react-icons/fi";

function LearningPaths({ paths }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]">
      <div>
        <h3 className="text-xl font-semibold text-white">Learning Paths</h3>
        <p className="mt-1 text-sm text-slate-400">Recommended paths to close the gap between where you are and where you want to be.</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {paths.map((path) => (
          <article
            key={path.title}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30 hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]"
          >
            <div>
              <h4 className="text-base font-semibold text-white">{path.title}</h4>
              <p className="mt-1 text-sm text-blue-300">{path.subtitle}</p>
              <div className="mt-4 flex gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>{path.lessons} lessons</span>
                <span>{path.duration}</span>
              </div>
            </div>

            <div className="rounded-full bg-blue-500/10 p-3 text-blue-300 transition group-hover:bg-blue-500/20">
              <FiPlayCircle className="text-2xl" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LearningPaths;
