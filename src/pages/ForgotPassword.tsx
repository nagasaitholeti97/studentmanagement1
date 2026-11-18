
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Watermark from "../components/Watermark";
import { ErrorBox } from "../components/ui";

export default function ForgotPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // UI demo only. This does not change the actual account password.
    setDone(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-tint px-6">
      <Watermark />

      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        {done ? (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Password Reset</h1>

            <p className="text-sm text-present">
              Password validation completed successfully.
            </p>

            <Link to="/login" className="btn block w-full text-center">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold">
              Create New Password
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Enter your new password and confirm it below.
            </p>

            <form
              onSubmit={handleResetPassword}
              className="mt-6 space-y-4"
            >
              <label className="block text-sm font-medium">
                New Password

                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input w-full pr-16"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-medium">
                Confirm Password

                <div className="relative mt-1">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input w-full pr-16"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <p className="text-xs text-slate-500">
                Password must contain at least 8 characters.
              </p>

              {error && <ErrorBox message={error} />}

              <button type="submit" className="btn w-full">
                Reset Password
              </button>
            </form>

            <p className="mt-5 text-center text-sm">
              <Link
                to="/login"
                className="text-brand hover:underline"
              >
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
