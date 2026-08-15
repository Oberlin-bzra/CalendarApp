import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { StickyNote, Plus, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types/note';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Could not load notes: ' + error.message);
    } else {
      setNotes((data ?? []) as Note[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!title.trim()) {
      setError('Please enter a title for the note.');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim() || null,
    });

    setSaving(false);

    if (error) {
      setError('Could not save the note: ' + error.message);
      return;
    }

    setTitle('');
    setContent('');
    setFormOpen(false);
    fetchNotes();
  };

  const handleDelete = async (noteId: string) => {
    setError(null);
    setDeletingId(noteId);

    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    setDeletingId(null);

    if (error) {
      setError('Could not delete the note: ' + error.message);
      return;
    }

    fetchNotes();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <StickyNote className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Notes</h2>
        </div>

        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-95"
        >
          {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen ? 'Cancel' : 'New note'}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300 animate-fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New note form */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl animate-slide-down"
        >
          <div>
            <label htmlFor="note-title" className="mb-1.5 block text-sm font-medium text-slate-300">
              Title
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery list"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label htmlFor="note-content" className="mb-1.5 block text-sm font-medium text-slate-300">
              Content (optional)
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here…"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save note
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-800 py-16 text-center">
          <StickyNote className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, i) => (
            <div
              key={note.id}
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl transition-colors hover:border-slate-700 animate-fade-in"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate text-sm font-semibold text-slate-100">
                  {note.title}
                </h3>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="flex-shrink-0 rounded-lg p-1.5 text-slate-600 opacity-0 transition-all hover:bg-red-950/40 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                  aria-label="Delete note"
                >
                  {deletingId === note.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              {note.content && (
                <p className="mb-3 flex-1 whitespace-pre-wrap text-sm text-slate-400 line-clamp-5">
                  {note.content}
                </p>
              )}
              <p className="mt-auto text-xs text-slate-600">
                {DATE_FORMATTER.format(new Date(note.created_at))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
