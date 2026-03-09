function Footer() {
  return (
    <footer className="mt-16 border-t border-blue-300/20 bg-[#091729]/80 py-8">
      <div className="section-shell flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-xl font-bold text-white">
          Career<span className="text-ai-accent">AI</span>
        </div>
        <p className="text-sm text-ai-text/70">Copyright © {new Date().getFullYear()} CareerAI. All rights reserved.</p>
        <div className="flex items-center gap-3 text-ai-text/80">
          <span className="rounded-lg border border-blue-300/20 px-2 py-1">X</span>
          <span className="rounded-lg border border-blue-300/20 px-2 py-1">in</span>
          <span className="rounded-lg border border-blue-300/20 px-2 py-1">GH</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
