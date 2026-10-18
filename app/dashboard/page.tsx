'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, Clock3, Compass, LayoutDashboard, LibraryBig, Pin, Sparkles, Star, Target, Zap } from 'lucide-react';

type ResourceState = { pinned?: boolean; favorite?: boolean; used?: boolean; rating?: number };
type Diagnostic = { readiness?: number; estimatedHours?: number; annualValue?: number; quizScore?: number; quizTotal?: number; skillMap?: Record<string, number>; savedAt?: string; recommendations?: { id: string; title: string; category: string }[] };
const resourceKey = 'le_shift_resource_states_v1';
const diagnosticKey = 'le_shift_latest_diagnostic_v1';

function safeRead<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function formatDate(value?: string) {
  if (!value) return 'Pas encore réalisé';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Récemment' : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function DashboardPage() {
  const [states, setStates] = useState<Record<string, ResourceState>>({});
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  useEffect(() => {
    const sync = () => { setStates(safeRead(resourceKey, {})); setDiagnostic(safeRead<Diagnostic | null>(diagnosticKey, null)); };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('le-shift-resource-state-change', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('le-shift-resource-state-change', sync); };
  }, []);
  const pinned = Object.values(states).filter(item => item.pinned).length;
  const favorites = Object.values(states).filter(item => item.favorite).length;
  const used = Object.values(states).filter(item => item.used).length;
  const rated = Object.values(states).filter(item => item.rating).length;
  const topSkills = diagnostic?.skillMap ? Object.entries(diagnostic.skillMap).sort((a,b)=>b[1]-a[1]).slice(0,3) : [];

  return <main className="admin-shell min-h-[80vh]">
    <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <div className="flex flex-col justify-between gap-5 border-b border-white/[.08] pb-8 sm:flex-row sm:items-end">
        <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-violet-300/[.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-violet-100"><LayoutDashboard size={13}/> Votre espace personnel</div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Votre trajectoire <span className="text-gradient">IA.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Retrouvez vos ressources, reprenez votre progression et transformez votre curiosité en habitudes concrètes.</p></div>
        <Link href="/diagnostic" className="neon-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold"><Sparkles size={15}/> {diagnostic ? 'Actualiser mon diagnostic' : 'Faire mon diagnostic'} <ArrowRight size={15}/></Link>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {label:'Ressources épinglées',value:pinned,sub:'À garder sous la main',Icon:Pin},
          {label:'Favoris',value:favorites,sub:'Vos ressources préférées',Icon:Star},
          {label:'Testées',value:used,sub:'Marquées comme utilisées',Icon:CheckCircle2},
          {label:'Notées',value:rated,sub:'Votre retour personnel',Icon:Bookmark},
        ].map(({label,value,sub,Icon})=><div key={label} className="glass-panel rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-400">{label}</span><Icon size={17} className="text-violet-200"/></div><p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-xs text-zinc-500">{sub}</p></div>)}
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="glass-panel rounded-3xl p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Votre diagnostic</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Carte de compétences</h2><p className="mt-2 text-sm text-zinc-400">{formatDate(diagnostic?.savedAt)}</p></div><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-300/[.08] text-violet-100"><Target size={19}/></span></div>
          {diagnostic ? <div className="mt-6 grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-violet-200/20 bg-violet-300/[.04] shadow-[0_0_55px_rgba(139,92,246,.10)]"><div className="absolute inset-2 rounded-full border border-violet-200/[.12]"/><div className="text-center"><p className="text-4xl font-semibold tabular-nums">{diagnostic.readiness ?? '—'}</p><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-zinc-500">Préparation IA /100</p></div></div>
            <div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/[.08] bg-black/10 p-3"><Clock3 size={15} className="text-violet-200"/><p className="mt-2 text-xl font-semibold">{Number(diagnostic.estimatedHours || 0).toFixed(1)} h</p><p className="text-[10px] text-zinc-500">Potentiel hebdomadaire estimé</p></div><div className="rounded-xl border border-white/[.08] bg-black/10 p-3"><Zap size={15} className="text-violet-200"/><p className="mt-2 text-xl font-semibold">{diagnostic.quizScore ?? 0}/{diagnostic.quizTotal ?? 4}</p><p className="text-[10px] text-zinc-500">Quiz de connaissances</p></div></div>
              {topSkills.length>0&&<div className="mt-4"><p className="mb-2 text-xs text-zinc-500">Compétences à consolider</p><div className="space-y-2">{topSkills.map(([key,value])=><div key={key}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="capitalize text-zinc-300">{key.replace(/([A-Z])/g,' $1')}</span><span className="text-violet-200">{value}/100</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-200" style={{width:Math.max(0,Math.min(100,value))+'%'}}/></div></div>)}</div></div>}
            </div>
          </div> : <div className="mt-6 rounded-2xl border border-dashed border-white/[.12] p-6 sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/[.08] text-violet-100"><Sparkles size={19}/></div><h3 className="mt-4 text-lg font-semibold">Votre carte commence ici.</h3><p className="mt-2 max-w-lg text-sm leading-6 text-zinc-400">Un diagnostic guidé vous aide à situer vos pratiques, visualiser vos compétences et recevoir des recommandations pertinentes. Vos résultats récents apparaîtront ici sur cet appareil.</p><Link href="/diagnostic" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-100 hover:text-white">Démarrer le diagnostic <ArrowRight size={14}/></Link></div>}
        </section>
        <section className="glass-panel rounded-3xl p-5 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Votre prochain mouvement</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Petit pas. Vrai progrès.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Choisissez une action simple pour avancer sans vous disperser.</p>
          <div className="mt-6 space-y-1">
            <Link href="/bibliotheque" className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[.035]"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/10 bg-violet-300/[.06] text-violet-100"><LibraryBig size={17}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Revoir ma bibliothèque</span><span className="mt-1 block text-xs text-zinc-500">{pinned} épinglée{pinned===1?'':'s'} · {used} testée{used===1?'':'s'}</span></span><ArrowRight size={15} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-200"/></Link>
            <Link href="/catalogue" className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[.035]"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/10 bg-violet-300/[.06] text-violet-100"><Compass size={17}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Découvrir une ressource</span><span className="mt-1 block text-xs text-zinc-500">Explorez par métier et par usage</span></span><ArrowRight size={15} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-200"/></Link>
            <Link href="/playbook" className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[.035]"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/10 bg-violet-300/[.06] text-violet-100"><Zap size={17}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Apprendre à connecter ses outils</span><span className="mt-1 block text-xs text-zinc-500">Guides et bonnes pratiques</span></span><ArrowRight size={15} className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-200"/></Link>
          </div>
          <div className="mt-5 rounded-xl border border-violet-200/[.12] bg-violet-300/[.04] p-4"><p className="text-xs leading-5 text-zinc-400">Confidentialité : vos épingles, favoris et ce résumé du diagnostic restent dans le stockage local de ce navigateur. Ils ne sont pas synchronisés entre appareils.</p></div>
        </section>
      </div>

      <section className="mt-7 rounded-3xl border border-white/[.08] bg-white/[.018] p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Continuer à explorer</p><h2 className="mt-2 text-xl font-semibold">Votre prochaine idée est peut-être déjà là.</h2><p className="mt-2 text-sm text-zinc-400">Parcourez les ressources et gardez celles que vous voulez tester.</p></div><Link href="/catalogue" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200/20 px-4 py-3 text-sm text-violet-100 transition hover:bg-violet-300/[.06]">Explorer le catalogue <ArrowRight size={14}/></Link></div></section>
    </section>
  </main>;
}
