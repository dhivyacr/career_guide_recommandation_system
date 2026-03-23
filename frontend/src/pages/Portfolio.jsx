import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiGithub,
  FiGlobe,
  FiLink,
  FiPlus,
  FiUpload,
  FiX
} from "react-icons/fi";
import { getStudentProfile } from "../services/studentService";

const STORAGE_KEY = "studentPortfolio";

const DEFAULT_PROJECTS = [
  {
    title: "Portfolio Website",
    description: "Personal portfolio website built with React and deployed with a polished responsive interface.",
    tech: ["React", "TailwindCSS", "Vite"],
    github: "https://github.com/username/portfolio-website",
    demo: "https://portfolio-demo.example.com",
    lastUpdated: "2026-03-10"
  },
  {
    title: "Career Guidance Dashboard",
    description: "Student dashboard for tracking goals, readiness analytics, skill gaps, and recommendation insights.",
    tech: ["React", "Node.js", "MongoDB", "Chart.js"],
    github: "https://github.com/username/career-guidance-dashboard",
    demo: "",
    lastUpdated: "2026-02-24"
  }
];

const DEFAULT_CERTIFICATES = [
  {
    name: "Machine Learning Certification",
    file: ""
  },
  {
    name: "Web Development Bootcamp",
    file: ""
  }
];

function readStoredPortfolio() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function buildPortfolioProfile(student = {}, storedPortfolio = {}) {
  const skills = Array.isArray(student.technicalSkills || student.skills)
    ? student.technicalSkills || student.skills
    : [];

  return {
    name: student.name || "Student",
    department: student.department || student.degree || "Not set",
    cgpa: Number(student.cgpa ?? student.gpa ?? 0) || 0,
    skills,
    projects: Array.isArray(storedPortfolio.projects) && storedPortfolio.projects.length
      ? storedPortfolio.projects
      : DEFAULT_PROJECTS,
    certificates: Array.isArray(storedPortfolio.certificates) && storedPortfolio.certificates.length
      ? storedPortfolio.certificates
      : DEFAULT_CERTIFICATES,
    github: storedPortfolio.github || {
      totalRepositories: 12,
      topLanguage: "JavaScript",
      totalStars: 18,
      profileLink: "https://github.com/username"
    },
    linkedIn: storedPortfolio.linkedIn || ""
  };
}

function formatDate(dateText) {
  if (!dateText) {
    return "Recently updated";
  }

  return new Date(dateText).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function buildSkillEvidence(projects = []) {
  const weightMap = {};

  projects.forEach((project) => {
    (project.tech || []).forEach((tech, index) => {
      weightMap[tech] = (weightMap[tech] || 0) + Math.max(1, 4 - index);
    });
  });

  const topWeight = Math.max(...Object.values(weightMap), 1);

  return Object.entries(weightMap)
    .map(([skill, score]) => ({
      skill,
      percentage: Math.round((score / topWeight) * 100)
    }))
    .sort((left, right) => right.percentage - left.percentage)
    .slice(0, 6);
}

function ProjectModal({ open, form, onChange, onClose, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#081323] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">New Project</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Add Project</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10"
            aria-label="Close project modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Project Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="Ex: Smart Career Tracker"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="What problem does it solve and what did you build?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Technologies</label>
              <input
                name="tech"
                value={form.tech}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">GitHub Link</label>
              <input
                name="github"
                value={form.github}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Live Demo Link</label>
            <input
              name="demo"
              value={form.demo}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              placeholder="https://your-demo-link.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Portfolio() {
  const resumeInputRef = useRef(null);
  const certificateInputRef = useRef(null);
  const storedPortfolio = useMemo(() => readStoredPortfolio(), []);
  const [portfolio, setPortfolio] = useState(() => buildPortfolioProfile({}, storedPortfolio));
  const [resume, setResume] = useState(storedPortfolio.resume || null);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    tech: "",
    github: "",
    demo: ""
  });

  useEffect(() => {
    let mounted = true;

    async function loadPortfolio() {
      try {
        const response = await getStudentProfile();
        const student = response.data?.student || {};

        if (!mounted) {
          return;
        }

        const freshStoredPortfolio = readStoredPortfolio();
        setPortfolio(buildPortfolioProfile(student, freshStoredPortfolio));
        setResume(freshStoredPortfolio.resume || null);
      } catch (_error) {
        if (!mounted) {
          return;
        }

        const storedProfile = JSON.parse(localStorage.getItem("studentProfile") || "{}");
        const freshStoredPortfolio = readStoredPortfolio();
        setPortfolio(buildPortfolioProfile(storedProfile, freshStoredPortfolio));
        setResume(freshStoredPortfolio.resume || null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, []);

  function persistPortfolio(updates) {
    const nextStoredPortfolio = {
      ...readStoredPortfolio(),
      ...updates
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStoredPortfolio));

    setPortfolio((current) => ({
      ...current,
      ...updates
    }));

    if (Object.prototype.hasOwnProperty.call(updates, "resume")) {
      setResume(updates.resume || null);
    }
  }

  function handleResumeUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    persistPortfolio({
      resume: {
        name: file.name,
        url: URL.createObjectURL(file)
      }
    });
  }

  function handleCertificateUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextCertificate = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      file: URL.createObjectURL(file)
    };

    persistPortfolio({
      certificates: [...portfolio.certificates, nextCertificate]
    });

    event.target.value = "";
  }

  function handleProjectFormChange(event) {
    const { name, value } = event.target;
    setProjectForm((current) => ({ ...current, [name]: value }));
  }

  function handleProjectSubmit(event) {
    event.preventDefault();

    const nextProject = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      tech: projectForm.tech
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      github: projectForm.github.trim(),
      demo: projectForm.demo.trim(),
      lastUpdated: new Date().toISOString()
    };

    if (!nextProject.title || !nextProject.description) {
      return;
    }

    persistPortfolio({
      projects: [nextProject, ...portfolio.projects]
    });

    setProjectForm({
      title: "",
      description: "",
      tech: "",
      github: "",
      demo: ""
    });
    setProjectModalOpen(false);
  }

  const portfolioStats = useMemo(() => {
    const completedSteps = [
      Boolean(resume?.name),
      portfolio.projects.length > 0,
      portfolio.certificates.length > 0,
      Boolean(portfolio.github?.profileLink),
      Boolean(portfolio.linkedIn)
    ].filter(Boolean).length;

    return {
      projectsCount: portfolio.projects.length,
      certificatesCount: portfolio.certificates.length,
      resumeUploaded: Boolean(resume?.name),
      completion: Math.round((completedSteps / 5) * 100)
    };
  }, [portfolio, resume]);

  const skillEvidence = useMemo(() => buildSkillEvidence(portfolio.projects), [portfolio.projects]);

  const completionChecklist = [
    { label: "Resume uploaded", done: Boolean(resume?.name) },
    { label: "Projects added", done: portfolio.projects.length > 0 },
    { label: "Certificates added", done: portfolio.certificates.length > 0 },
    { label: "GitHub linked", done: Boolean(portfolio.github?.profileLink) },
    { label: "LinkedIn profile added", done: Boolean(portfolio.linkedIn) }
  ];

  return (
    <div className="relative text-[#e5e7eb]">
      <ProjectModal
        open={projectModalOpen}
        form={projectForm}
        onChange={handleProjectFormChange}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[14%] top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-16 right-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Portfolio Dashboard</p>
          <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/25 to-cyan-400/20 text-2xl font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                {String(portfolio.name || "ST")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white">{portfolio.name}</h1>
                <p className="mt-2 text-sm text-slate-400">{portfolio.department}</p>
                <p className="mt-1 text-sm text-slate-300">CGPA: {portfolio.cgpa ? portfolio.cgpa.toFixed(1) : "Not set"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[440px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Projects</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioStats.projectsCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Certificates</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioStats.certificatesCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resume</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {portfolioStats.resumeUploaded ? "Uploaded" : "Pending upload"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Completion</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioStats.completion}%</p>
              </div>
            </div>
          </div>

          {loading ? <p className="mt-4 text-sm text-slate-400">Loading portfolio...</p> : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Portfolio Strength</h2>
                <p className="mt-2 text-sm text-slate-400">A quick snapshot of how complete and recruiter-ready your profile looks.</p>
              </div>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
                {portfolioStats.completion}% complete
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-900/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                style={{ width: `${portfolioStats.completion}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Projects added</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioStats.projectsCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Certificates added</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolioStats.certificatesCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resume status</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {portfolioStats.resumeUploaded ? "Uploaded and ready" : "Upload pending"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Skill coverage</p>
                <p className="mt-2 text-sm font-semibold text-white">{portfolio.skills.length} skills validated</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">GitHub Activity</h2>
                <p className="mt-2 text-sm text-slate-400">Showcase proof of execution through your public code footprint.</p>
              </div>
              <FiGithub className="h-6 w-6 text-slate-300" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Repositories</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolio.github.totalRepositories}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Top language</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolio.github.topLanguage}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total stars</p>
                <p className="mt-2 text-2xl font-semibold text-white">{portfolio.github.totalStars}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Profile</p>
                <a
                  href={portfolio.github.profileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  <FiLink className="h-4 w-4" />
                  Open GitHub profile
                </a>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <p className="mt-2 text-sm text-slate-400">Professional project cards that show both technical depth and delivery quality.</p>
            </div>
            <button
              type="button"
              onClick={() => setProjectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <FiPlus className="h-4 w-4" />
              Add Project
            </button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {portfolio.projects.map((project) => (
              <article key={`${project.title}-${project.github}`} className="rounded-[24px] border border-white/10 bg-[#0a1628]/80 p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{project.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {formatDate(project.lastUpdated)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tech || []).map((tech) => (
                    <span
                      key={`${project.title}-${tech}`}
                      className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-100"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      <FiGithub className="h-4 w-4" />
                      GitHub
                    </a>
                  ) : null}
                  {project.demo ? (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      <FiGlobe className="h-4 w-4" />
                      Live Demo
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Skills Evidence</h2>
            <p className="mt-2 text-sm text-slate-400">Skills validated by project work and visible delivery artifacts.</p>

            <div className="mt-6 space-y-4">
              {skillEvidence.length ? (
                skillEvidence.map((item) => (
                  <div key={item.skill}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{item.skill}</span>
                      <span className="text-slate-400">{item.percentage}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Add projects to generate skill evidence bars.</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Portfolio Completion Tracker</h2>
              <div className="mt-5 space-y-3">
                {completionChecklist.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm"
                  >
                    <span className={item.done ? "text-emerald-300" : "text-slate-500"}>
                      {item.done ? <FiCheckCircle className="h-5 w-5" /> : <span className="text-lg">X</span>}
                    </span>
                    <span className={item.done ? "text-slate-100" : "text-slate-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Resume</h2>
                  <p className="mt-2 text-sm text-slate-400">Upload your latest resume or open the current version.</p>
                </div>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <FiUpload className="h-4 w-4" />
                  Upload Resume
                </button>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={resume?.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition ${
                    resume?.url ? "bg-white/5 text-slate-200 hover:bg-white/10" : "pointer-events-none bg-white/5 text-slate-500"
                  }`}
                >
                  <FiFileText className="h-4 w-4" />
                  View Resume
                </a>
              </div>

              <p className="mt-4 text-sm text-slate-300">{resume?.name || "No resume uploaded yet."}</p>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Certificates</h2>
                  <p className="mt-2 text-sm text-slate-400">Upload certificates and keep proof of learning visible in one place.</p>
                </div>
                <button
                  type="button"
                  onClick={() => certificateInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <FiUpload className="h-4 w-4" />
                  Upload Certificate
                </button>
              </div>

              <input
                ref={certificateInputRef}
                type="file"
                accept=".pdf"
                onChange={handleCertificateUpload}
                className="hidden"
              />

              <div className="mt-4 space-y-3">
                {portfolio.certificates.map((certificate) => (
                  <div
                    key={`${certificate.name}-${certificate.file || "static"}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a1628]/80 px-4 py-3 text-sm text-slate-200"
                  >
                    <span>{typeof certificate === "string" ? certificate : certificate.name}</span>
                    <a
                      href={typeof certificate === "string" ? "#" : certificate.file || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold transition ${
                        typeof certificate === "string" || !certificate.file
                          ? "pointer-events-none bg-white/5 text-slate-500"
                          : "bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <FiFileText className="h-4 w-4" />
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Core Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {portfolio.skills.length ? (
              portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-[#9fd1ff]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">No skills added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Portfolio;
