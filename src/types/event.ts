export type EventCategory = 'Work' | 'Personal' | 'School';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  start_time: string; // ISO string
  end_time: string; // ISO string
  all_day: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryConfig {
  label: EventCategory;
  color: string; // hex value, stored in the DB
  dot: string; // Tailwind class for small color dots
  badge: string; // Tailwind classes for badges/chips
}

export const CATEGORIES: CategoryConfig[] = [
  {
    label: 'Work',
    color: '#6366f1', // indigo-500
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    label: 'Personal',
    color: '#10b981', // emerald-500
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    label: 'School',
    color: '#f59e0b', // amber-500
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
];

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[0];
}
