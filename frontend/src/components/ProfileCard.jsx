function ProfileCard({ profile, variant = "summary" }) {
  if (variant === "welcome") {
    return (
      <section className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] p-6 shadow-[0_12px_32px_rgba(59,130,246,0.32)]">
        <h3 className="text-xl font-semibold text-white">Welcome! Let&apos;s get started.</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50/95">
          To give you the best career recommendations and learning paths, we need a bit more information.
          Please complete your profile to unlock your personalized dashboard.
        </p>
      </section>
    );
  }

  return (
    <section className="glow-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-100">
          {String(profile.name || "ST").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{profile.name || "Student"}</h3>
          <p className="text-sm text-ai-text/75">{profile.education || "Education profile pending"}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ai-text/80">
        <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-2">
          Skills: {profile.skillsCount}
        </div>
        <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-2">
          Interests: {profile.interestsCount}
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
