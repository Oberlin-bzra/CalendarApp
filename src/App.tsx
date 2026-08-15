import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import Auth from './components/Auth';
import Calendar from './components/Calendar';
import Notes from './components/Notes';
import { CalendarDays, StickyNote, LogOut, AlertTriangle, Loader2 } from 'lucide-react';

type View = 'calendar' | 'notes';

/**
 * Shown while VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set.
 * Prevents the app from crashing with an unclear error.
 */
function MissingEnvWarning() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-amber-900/50 bg-amber-950/20 p-8 shadow-2xl animate-scale-in">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-100">
            Supabase configuration missing
          </h1>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          The environment variables{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300">VITE_SUPABASE_URL</code>{' '}
          and/or <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300">VITE_SUPABASE_ANON_KEY</code>{' '}
          are not set. Without these values the app cannot connect to Supabase.
        </p>

        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            How to fix this:
          </p>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-slate-300">
            <li>
              Create a file named{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">.env.local</code>{' '}
              in the project root
            </li>
            <li>Add the following lines and fill in your values:</li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 text-xs text-emerald-300">
{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY`}
          </pre>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-slate-300" start={3}>
            <li>
              You can find both values in the Supabase Dashboard under{' '}
              <span className="text-slate-200">Settings → API</span>
            </li>
            <li>
              Restart the dev server (e.g. run{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">npm run dev</code>{' '}
              again)
            </li>
          </ol>
        </div>

        <p className="text-xs text-slate-500">
          Note: files matching the pattern <code className="text-slate-400">.env*</code> should
          not be committed to version control.
        </p>
      </div>
    </div>
  );
}

function Navbar({
  email,
  view,
  onViewChange,
  onSignOut,
}: {
  email: string | undefined;
  view: View;
  onViewChange: (view: View) => void;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <CalendarDays className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-semibold text-slate-100">Kalendo</span>
          </div>

          {/* View tabs */}
          <nav className="hidden items-center gap-1 rounded-lg bg-slate-900/60 p-1 sm:flex">
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-slate-100 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => onViewChange('notes')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                view === 'notes'
                  ? 'bg-slate-100 text-slate-900 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-400 sm:inline">{email}</span>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-100 active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile view tabs */}
      <nav className="flex items-center gap-1 border-t border-slate-800 bg-slate-900/40 p-1 sm:hidden">
        <button
          onClick={() => onViewChange('calendar')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            view === 'calendar'
              ? 'bg-slate-100 text-slate-900 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Calendar
        </button>
        <button
          onClick={() => onViewChange('notes')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            view === 'notes'
              ? 'bg-slate-100 text-slate-900 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Notes
        </button>
      </nav>
    </header>
  );
}

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('calendar');

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-950">
      <Navbar email={user.email} view={view} onViewChange={setView} onSignOut={signOut} />
      {view === 'calendar' ? <Calendar /> : <Notes />}
    </div>
  );
}

export default function App() {
  // Check this early, before any auth/Supabase calls happen
  if (!isSupabaseConfigured) {
    return <MissingEnvWarning />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}