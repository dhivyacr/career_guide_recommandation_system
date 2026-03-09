import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-12">
      <div className="card-container w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white">Login</h1>
        <p className="mt-2 text-sm text-ai-text/70">Access your personalized career dashboard.</p>
        <form className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-blue-300/20 bg-ai-secondary px-4 py-3 outline-none focus:border-ai-accent" placeholder="Email" />
          <input className="w-full rounded-xl border border-blue-300/20 bg-ai-secondary px-4 py-3 outline-none focus:border-ai-accent" type="password" placeholder="Password" />
          <button type="button" className="button-gradient w-full">Login</button>
        </form>
        <p className="mt-4 text-sm text-ai-text/70">
          New user? <Link to="/register" className="text-ai-accent">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
