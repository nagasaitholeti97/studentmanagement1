
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { homeFor, useAuth } from "../auth/AuthContext";
import { USE_MOCK } from "../api/client";
import { DEMO } from "../api/mock";
import CollegeBanner from "../components/CollegeBanner";
import Watermark from "../components/Watermark";
import { ErrorBox } from "../components/ui";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      // Backend identifies whether the user is Student or Faculty.
      const role = await signIn(identifier, password);
      navigate(homeFor(role), { replace: true });
    } catch (err) {
      setError(
        (err as Error).message || "Could not sign in. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">

      {/* College Header */}
      <header className="bg-ink px-6 py-8 text-center text-white">
        <CollegeBanner variant="login" />
      </header>

      {/* Login Form */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-brand-tint px-6 py-10">

        <Watermark />

        <form
          onSubmit={submit}
          className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm"
          aria-labelledby="signin"
        >

          <h2 id="signin" className="text-xl font-bold">
            Sign in
          </h2>

          {/* Email / Register Number */}
          <label className="block text-sm font-medium">
            Register number or email

            <input
              className="input mt-1"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </label>

          {/* Password */}
          <label className="block text-sm font-medium">
            Password

            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {/* Error Message */}
          {error && <ErrorBox message={error} />}

          {/* Login Button */}
          <button
            className="btn w-full"
            disabled={busy}
          >
            {busy ? "Signing in..." : "Log in"}
          </button>

          {/* Forgot Password */}
          <p className="text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </p>

          {/* Register Link */}
          <div className="border-t border-slate-200 pt-4 text-center">

            <p className="text-sm text-slate-600">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="mt-2 inline-block font-semibold text-brand hover:underline"
            >
              Create Account / Register
            </Link>

            <p className="mt-2 text-xs text-slate-500">
              Register as Student or Faculty
            </p>

          </div>

          {/* Demo Credentials */}
          {USE_MOCK && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">

              <p className="font-semibold">
                Demo mode (no backend connected)
              </p>

              <p className="mt-1">
                Student: {DEMO.student.id} / {DEMO.student.pw}
              </p>

              <p>
                Faculty: {DEMO.faculty.id} / {DEMO.faculty.pw}
              </p>

            </div>
          )}

        </form>
      </main>
    </div>
  );
}
