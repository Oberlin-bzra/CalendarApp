import { useState, type FormEvent } from 'react';
import { X, Trash2, Loader2, AlertCircle, Type, AlignLeft, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, getCategoryConfig, type CalendarEvent, type EventCategory } from '../types/event';

interface EventModalProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onChanged: () => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export default function EventModal({ date, events, onClose, onChanged }: EventModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Work');

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!title.trim()) {
      setError('Please enter a title for the event.');
      return;
    }

    setSaving(true);

    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(date);
    end.setHours(10, 0, 0, 0);

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      all_day: false,
      color: getCategoryConfig(category).color,
    });

    setSaving(false);

    if (error) {
      setError('Could not save the event: ' + error.message);
      return;
    }

    setTitle('');
    setDescription('');
    setCategory('Work');
    onChanged();
  };

  const handleDelete = async (eventId: string) => {
    setError(null);
    setDeletingId(eventId);

    const { error } = await supabase.from('events').delete().eq('id', eventId);

    setDeletingId(null);

    if (error) {
      setError('Could not delete the event: ' + error.message);
      return;
    }

    onChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Events</h3>
            <p className="text-sm text-slate-500">{DATE_FORMATTER.format(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing events for this day */}
        {events.length > 0 && (
          <div className="border-b border-slate-800 px-6 py-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Existing events
            </h4>
            <ul className="space-y-2">
              {events.map((event) => {
                const config = getCategoryConfig(event.category);
                return (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-2.5 transition-colors hover:bg-slate-800/60"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${config.dot}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">{event.title}</p>
                        {event.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {event.description}
                          </p>
                        )}
                        <span
                          className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.badge}`}
                        >
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex-shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
                      aria-label="Delete event"
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Create new event */}
        <form onSubmit={handleCreate} className="space-y-4 px-6 py-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Create new event
          </h4>

          <div>
            <label htmlFor="title" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
              <Type className="h-3.5 w-3.5" />
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"
            >
              <AlignLeft className="h-3.5 w-3.5" />
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about this event…"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
              <Tag className="h-3.5 w-3.5" />
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all active:scale-95 ${
                    category === cat.label
                      ? `${cat.badge} ring-2 ring-offset-2 ring-offset-slate-900`
                      : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                  }`}
                  style={category === cat.label ? { boxShadow: `0 0 0 2px ${cat.color}` } : undefined}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${cat.dot}`} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300 animate-fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
