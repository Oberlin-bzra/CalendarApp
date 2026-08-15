import { useState, type FormEvent } from 'react';
import {
  CalendarDays,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  MailCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function Auth() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmationSent(false);
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) setError(error);
      return;
    }

    const result = await signUp(email, password);
    setLoading(false);

    switch (result.status) {
      case 'error':
        setError(result.message);
        break;
      case 'already_registered':
        setError('An account with this email already exists. Try logging in instead.');
        break;
      case 'confirmation_required':
        setConfirmationSent(true);
        break;
      case 'success':
        // Session is active immediately (email confirmation disabled) —
        // AuthContext will pick up the new session automatically.
        break;
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError(null);
    setConfirmationSent(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo / Title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <CalendarDays className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Kalendo
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Sign in to continue' : 'Create a new account'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
          {confirmationSent ? (
            // Post sign-up confirmation state
            <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15">
                <MailCheck className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-100">Check your inbox</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  We've sent a confirmation link to{' '}
                  <span className="font-medium text-slate-200">{email}</span>. Click the
                  link in that email to activate your account, then come back here to log in.
                </p>
              </div>
              <div className="flex w-full items-start gap-2 rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-2.5 text-left text-xs text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Can't find the email? Check your spam or junk folder. It can take a
                  minute or two to arrive.
                </span>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                <LogIn className="h-4 w-4" />
                Back to login
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-6 flex rounded-xl bg-slate-800/60 p-1">
                <button
                  type="button"
                  onClick={() => mode !== 'login' && toggleMode()}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    isLogin
                      ? 'bg-slate-100 text-slate-900 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => mode !== 'register' && toggleMode()}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    !isLogin
                      ? 'bg-slate-100 text-slate-900 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300 animate-fade-in">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : isLogin ? (
                    <LogIn className="h-4.5 w-4.5" />
                  ) : (
                    <UserPlus className="h-4.5 w-4.5" />
                  )}
                  {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {isLogin ? 'Register now' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}