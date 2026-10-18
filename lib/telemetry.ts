import { supabase } from '@/lib/supabase';

type EventType = 'page_view' | 'page_exit' | 'diagnostic_start' | 'diagnostic_complete' | 'ad_impression' | 'ad_click';
const VISITOR_KEY = 'le_shift_visitor_v1';
const SESSION_KEY = 'le_shift_session_v1';

function stableId(storage: Storage, key: string): string {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 3 | 8)).toString(16);
          });
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return '00000000-0000-4000-8000-000000000001';
  }
}

export function getVisitorId() {
  return typeof window === 'undefined' ? '00000000-0000-4000-8000-000000000001' : stableId(window.localStorage, VISITOR_KEY);
}
export function getSessionId() {
  return typeof window === 'undefined' ? '00000000-0000-4000-8000-000000000001' : stableId(window.sessionStorage, SESSION_KEY);
}

export async function trackEvent(event_type: EventType, path: string, duration_seconds = 0, metadata: Record<string, unknown> = {}) {
  if (!supabase || typeof window === 'undefined') return;
  const safePath = path.slice(0, 500);
  const { error } = await supabase.from('analytics_events').insert({
    event_type,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    path: safePath,
    referrer: event_type === 'page_view' ? (document.referrer ? new URL(document.referrer).origin : null) : null,
    duration_seconds: Math.max(0, Math.min(86400, Math.round(duration_seconds))),
    locale: navigator.language.slice(0, 40),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 100) || null,
    metadata,
  });
  if (error && process.env.NODE_ENV !== 'production') console.debug('Le Shift analytics unavailable', error.message);
}
