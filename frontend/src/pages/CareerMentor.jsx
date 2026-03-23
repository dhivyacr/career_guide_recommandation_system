import { useEffect, useMemo, useRef, useState } from "react";
import { FiCornerDownRight, FiMessageSquare, FiSend, FiStar } from "react-icons/fi";
import { getDashboardData } from "../services/api";

function formatList(values = []) {
  const cleaned = values.filter(Boolean);

  if (!cleaned.length) {
    return "";
  }

  if (cleaned.length === 1) {
    return cleaned[0];
  }

  if (cleaned.length === 2) {
    return `${cleaned[0]} and ${cleaned[1]}`;
  }

  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
}

function buildFallbackAnswer(question, context) {
  const normalizedQuestion = String(question || "").toLowerCase();
  const bestCareer = context.recommendations[0]?.careerName || "your target career";
  const topCareers = context.recommendations.slice(0, 3).map((item) => item.careerName);
  const missingSkills = context.skillGap.slice(0, 4);
  const matchedSkills = context.recommendations[0]?.matchedSkills?.slice(0, 3) || [];

  if (normalizedQuestion.includes("career") || normalizedQuestion.includes("role")) {
    return `Based on your current profile, ${formatList(topCareers) || bestCareer} look like your strongest options. ${matchedSkills.length ? `That fit is driven by your strength in ${formatList(matchedSkills)}.` : ""}`.trim();
  }

  if (normalizedQuestion.includes("skill") || normalizedQuestion.includes("gap") || normalizedQuestion.includes("learn")) {
    return `${missingSkills.length ? `To improve readiness for ${bestCareer}, focus next on ${formatList(missingSkills)}.` : `You already cover the main skills for ${bestCareer}.`} Prioritize one core tool, one project, and one revision cycle each week.`;
  }

  if (normalizedQuestion.includes("project") || normalizedQuestion.includes("portfolio") || normalizedQuestion.includes("build")) {
    return `Build one portfolio project aligned to ${bestCareer}, then add a second project that proves ${missingSkills[0] || "problem solving"} in a real workflow. Keep the scope small enough to finish and publish.`;
  }

  return `For your current profile, the next best move is to improve ${formatList(missingSkills) || "your practical project depth"} and keep building toward ${bestCareer}. Ask about careers, skills, projects, or interview prep for more specific guidance.`;
}

function CareerMentor() {
  const messagesEndRef = useRef(null);
  const storedProfile = useMemo(() => JSON.parse(localStorage.getItem("studentProfile") || "{}"), []);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Ask about careers, missing skills, projects, or interview prep. I will answer using your current recommendation profile."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState({
    name: storedProfile.name || "Student",
    recommendations: [],
    skillGap: [],
    readiness: 0
  });

  useEffect(() => {
    let active = true;

    async function loadContext() {
      try {
        const response = await getDashboardData();
        const data = response.data || {};

        if (!active) {
          return;
        }

        setContext({
          name: data.student?.name || storedProfile.name || "Student",
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
          skillGap: Array.isArray(data.skillGap) ? data.skillGap : [],
          readiness: Number(data.analytics?.readiness || 0)
        });
      } catch {
        if (!active) {
          return;
        }

        setContext((current) => ({
          ...current,
          name: storedProfile.name || current.name
        }));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadContext();

    return () => {
      active = false;
    };
  }, [storedProfile.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const question = input.trim();

    if (!question || sending) {
      return;
    }

    const userMessage = {
      id: `student-${Date.now()}`,
      sender: "student",
      text: question
    };
    const aiMessage = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: buildFallbackAnswer(question, context)
    };

    setSending(true);
    setMessages((current) => [...current, userMessage, aiMessage]);
    setInput("");
    window.setTimeout(() => {
      setSending(false);
    }, 200);
  }

  const quickPrompts = [
    "Which career fits my skills best?",
    "What skills should I improve next?",
    "What projects should I build?"
  ];

  return (
    <section className="space-y-8 p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">AI CAREER MENTOR</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Interactive career guidance based on your profile.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Ask targeted questions about careers, missing skills, portfolio projects, and interview preparation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best Match</p>
              <p className="mt-2 text-base font-semibold text-white">
                {context.recommendations[0]?.careerName || "Not generated yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Readiness</p>
              <p className="mt-2 text-base font-semibold text-white">{context.readiness}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.55fr]">
        <aside className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
                <FiStar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Conversation Starters</h2>
                <p className="text-sm text-slate-400">Use these to get focused recommendations quickly.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <FiCornerDownRight className="h-4 w-4 text-cyan-300" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Current Skill Focus</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {context.skillGap.length ? (
                context.skillGap.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No critical skill gaps available.</span>
              )}
            </div>
          </article>
        </aside>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200">
              <FiMessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Chat with Your Mentor</h2>
              <p className="text-sm text-slate-400">
                Guidance is tailored to {context.name}&apos;s current recommendation profile.
              </p>
            </div>
          </div>

          <div className="mt-6 flex h-[460px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#081323]/85">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                      message.sender === "student"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {loading ? <p className="text-sm text-slate-400">Loading mentoring context...</p> : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-950/35 p-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask a career question..."
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSend className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
}

export default CareerMentor;
