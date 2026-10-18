'use client';
import { useEffect, useState } from 'react';
import { Bookmark, CheckCircle2, Star } from 'lucide-react';
import { getVisitorId } from '@/lib/telemetry';
import { supabase } from '@/lib/supabase';

type State = { pinned?: boolean; favorite?: boolean; used?: boolean; rating?: number };
const STORAGE_KEY = 'le_shift_resource_states_v1';
function readAll(): Record<string,State> { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }

export default function ResourceActions({resourceKey, resourceUuid}: {resourceKey:string; resourceUuid?:string}) {
  const [state,setState] = useState<State>({});
  const [average,setAverage] = useState<number|null>(null);
  const [ratingCount,setRatingCount] = useState(0);
  useEffect(() => {
    const sync = () => setState(readAll()[resourceKey] || {});
    sync();
    window.addEventListener('storage', sync);
    if (supabase && resourceUuid) void supabase.from('resource_rating_summary').select('average_rating,rating_count').eq('skill_id',resourceUuid).maybeSingle().then(({data}) => {
      if (data) { setAverage(Number(data.average_rating)); setRatingCount(Number(data.rating_count)); }
    });
    return () => window.removeEventListener('storage', sync);
  }, [resourceKey,resourceUuid]);
  function patch(patch: Partial<State>) {
    const all = readAll(); const next = {...(all[resourceKey] || {}),...patch};
    all[resourceKey] = next;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(all)); } catch {}
    setState(next);
    window.dispatchEvent(new CustomEvent('le-shift-resource-state-change'));
  }
  async function rate(value:number) {
    patch({rating:value});
    if (supabase && resourceUuid) {
      const visitor_id = getVisitorId();
      const {error} = await supabase.rpc('save_resource_rating',{p_skill_id:resourceUuid,p_visitor_id:visitor_id,p_rating:value});
      if (!error) {
        const {data} = await supabase.from('resource_rating_summary').select('average_rating,rating_count').eq('skill_id',resourceUuid).maybeSingle();
        if (data) {setAverage(Number(data.average_rating));setRatingCount(Number(data.rating_count));}
      }
    }
  }
  return <div className="mt-3 rounded-xl border border-white/[.07] bg-black/10 p-3" aria-label="Classer et noter cette ressource">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={()=>patch({pinned:!state.pinned})} aria-pressed={!!state.pinned} className={'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs '+(state.pinned?'border-cyan-200/30 bg-cyan-200/10 text-cyan-100':'border-white/10 text-zinc-400')}><Bookmark size={13} fill={state.pinned?'currentColor':'none'}/>{state.pinned?'Épinglée':'Épingler'}</button>
      <button type="button" onClick={()=>patch({favorite:!state.favorite})} aria-pressed={!!state.favorite} className={'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs '+(state.favorite?'border-amber-200/30 bg-amber-200/10 text-amber-100':'border-white/10 text-zinc-400')}><Star size={13} fill={state.favorite?'currentColor':'none'}/>{state.favorite?'Favorite':'Favori'}</button>
      <button type="button" onClick={()=>patch({used:!state.used})} aria-pressed={!!state.used} className={'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs '+(state.used?'border-emerald-200/30 bg-emerald-200/10 text-emerald-100':'border-white/10 text-zinc-400')}><CheckCircle2 size={13}/>{state.used?'Utilisée':'Pas encore utilisée'}</button>
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1" aria-label="Votre note sur cinq">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>void rate(n)} aria-label={`Noter ${n} sur 5`} aria-pressed={state.rating===n} className={'rounded p-0.5 '+(n<=(state.rating||0)?'text-amber-300':'text-zinc-600 hover:text-amber-200')}><Star size={16} fill={n<=(state.rating||0)?'currentColor':'none'}/></button>)}<span className="ml-1 text-xs text-zinc-500">Votre note</span></div>{average!==null&&<span className="text-xs text-zinc-500">{average.toFixed(1)}/5 · {ratingCount} avis</span>}</div>
  </div>;
}
