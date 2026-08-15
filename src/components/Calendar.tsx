import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getCategoryConfig, type CalendarEvent } from '../types/event';
import EventModal from './EventModal';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Monday as the start of the week (0 = Monday ... 6 = Sunday)
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Builds the full grid (including leading/trailing days) for the month view */
function buildMonthGrid(current: Date): Date[] {
  const first = startOfMonth(current);
  const last = endOfMonth(current);
  const leading = mondayIndex(first);
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;

  const days: Date[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - leading + 1;
    days.push(new Date(current.getFullYear(), current.getMonth(), dayNumber));
  }
  return days;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthGrid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const today = new Date();

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Load with a small buffer so leading/trailing days are covered too
    const rangeStart = new Date(monthGrid[0]);
    const rangeEnd = new Date(monthGrid[monthGrid.length - 1]);
    rangeEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', rangeStart.toISOString())
      .lte('start_time', rangeEnd.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      setError('Could not load events: ' + error.message);
    } else {
      setEvents((data ?? []) as CalendarEvent[]);
    }
    setLoading(false);
  }, [user, monthGrid]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = new Date(event.start_time).toDateString();
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const openModalForDay = (day: Date) => {
    setSelectedDate(day);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const handleEventChanged = () => {
    fetchEvents();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 animate-fade-in">
      {/* Header with navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-all hover:border-slate-700 hover:text-slate-100 active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-slate-700 hover:text-slate-100 active:scale-95"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-all hover:border-slate-700 hover:text-slate-100 active:scale-95"
            aria-label="Next month"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => openModalForDay(new Date())}
            className="ml-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Event
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300 animate-fade-in">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/80">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="relative grid grid-cols-7">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          )}

          {monthGrid.map((day, index) => {
            const inCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, today);
            const dayEvents = eventsByDay.get(day.toDateString()) ?? [];

            return (
              <button
                key={index}
                onClick={() => openModalForDay(day)}
                className={`group relative flex min-h-[110px] flex-col items-start gap-1 border-b border-r border-slate-800 p-2 text-left transition-colors last:border-r-0 hover:bg-slate-800/40 ${
                  !inCurrentMonth ? 'bg-slate-950/40' : ''
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isToday
                      ? 'bg-indigo-500 text-white'
                      : inCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                  }`}
                >
                  {day.getDate()}
                </span>

                <div className="flex w-full flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => {
                    const config = getCategoryConfig(event.category);
                    return (
                      <div
                        key={event.id}
                        className={`flex items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-transform group-hover:translate-x-0.5 ${config.badge}`}
                        title={event.title}
                      >
                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.dot}`} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="pl-1 text-[11px] text-slate-500">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {modalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          events={eventsByDay.get(selectedDate.toDateString()) ?? []}
          onClose={closeModal}
          onChanged={handleEventChanged}
        />
      )}
    </div>
  );
}
