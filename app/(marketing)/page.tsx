'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bot, Braces, CircleCheck, Command, GitFork, Layers3, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import SkillCard from '@/components/skill-card';
import { skills as fallbackSkills, type Skill } from '@/lib/skills';
import { supabase } from '@/lib/supabase';

type Row = {
  id: string; slug: string; title: string; description: string; category: string;
  kind: string; time_saved: string | null; price_amount: number | string | null;
  price_label: string | null; tag: string | null; impact: string | null; status: string;
};

function mapRow(row: Row): Skill {
  const type: Skill['type'] = row.kind === 'Serveur MCP' ? 'mcp'
    : row.kind === 'Agent IA' ? 'agent'
    : row.kind === 'Plugin / Extension' ? 'plugin'
    : row.kind === 'Workflow' ? 'workflow' : 'prompt';
  return {
    id: row.slug || row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price_amount || 0),
    priceLabel: row.price_label || 'À vérifier',
    expected_roi: row.time_saved || 'À évaluer',
    type,
    timeSaved: row.time_saved || 'À évaluer',
    tag: row.tag || row.impact || row.kind,
    icon: type === 'mcp' ? '⌁' : type === 'agent' ? '◉' : type === 'plugin' ? '⟡' : type === 'workflow' ? '⟳' : '✳',
  };
}

const resourceTypes = [
  { name: 'Claude Skills', description: 'Des instructions réutilisables pour des tâches métier.', Icon: Sparkles },
  { name: 'Serveurs MCP', description: 'Connectez vos modèles à des outils et données.', Icon: Braces },
  { name: 'Agents IA', description: 'Des agents qui enchaînent des tâches et utilisent des outils.', Icon: Bot },
  { name: 'Plugins & workflows', description: 'Étendez votre stack et automatisez vos opérations.', Icon: Layers3 },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Skill[]>(fallbackSkills.slice(0, 3));
  const [total, setTotal] = useState(103);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.from('skills')
      .select('id,slug,title,description,category,kind,time_saved,price_amount,price_label,tag,impact,status')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (active && data?.length) setFeatured((data as Row[]).map(mapRow));
      });
    void supabase.from('skills').select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .then(({ count }) => {
        if (active && typeof count === 'number') setTotal(count);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="site-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div className="reveal-up">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[.055] px-3.5 py-2 text-xs text-cyan-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              </span>
              La boîte à outils des professionnels augmentés
              <ArrowUpRight size={13} />
            </div>
            <h1 data-text="Votre avantage déloyal." className="glitch max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.06em] sm:text-7xl lg:text-[84px]">
              Votre <span className="text-gradient">avantage déloyal.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Le répertoire indépendant pour découvrir les meilleurs <span className="text-zinc-100">Claude Skills, MCP, agents IA et automatisations</span> — et les connecter à votre façon de travailler.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalogue" className="neon-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">
                Explorer {total} ressources <ArrowRight size={16} />
              </Link>
              <Link href="/playbook" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-5 py-3.5 text-sm text-zinc-200 transition hover:border-violet-300/30 hover:bg-white/[.05]">
                Voir le guide d’installation <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><GitFork size={13} /> Dépôts GitHub publics</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Liens vers les sources</span>
              <span className="inline-flex items-center gap-1.5"><CircleCheck size={13} /> Catalogue filtrable</span>
            </div>
          </div>
          <div className="neon-frame glass-panel relative mx-auto w-full max-w-[520px] rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[.08] pb-4">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-300/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-200/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" /></div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500"><Command size={13} /> SHIFT / TOOLBOX</div>
            </div>
            <div className="py-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">Votre stack augmentée</p>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 text-[10px] text-emerald-200">LIVE DIRECTORY</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '✳', title: 'Claude Skills', sub: 'Instructions métier réutilisables', color: 'text-violet-200', bg: 'bg-violet-300/10' },
                  { icon: '⌁', title: 'Model Context Protocol', sub: 'Outils et données connectés', color: 'text-cyan-100', bg: 'bg-cyan-300/10' },
                  { icon: '◉', title: 'Agents & automations', sub: 'Orchestration et exécution', color: 'text-fuchsia-100', bg: 'bg-fuchsia-300/10' },
                ].map((item, index) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-white/[.075] bg-black/20 p-3.5 reveal-up" style={{ animationDelay: (index * 0.12) + 's' }}>
                    <div className={item.bg + ' ' + item.color + ' flex h-11 w-11 items-center justify-center rounded-xl text-xl'}>{item.icon}</div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-zinc-500">{item.sub}</p></div>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xl font-semibold">{total}+</p><p className="mt-1 text-[10px] text-zinc-500">Ressources</p></div>
                <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xl font-semibold">5</p><p className="mt-1 text-[10px] text-zinc-500">Formats</p></div>
                <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-xl font-semibold">∞</p><p className="mt-1 text-[10px] text-zinc-500">Possibilités</p></div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/[.08] pt-4 text-[11px] text-zinc-500"><span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-cyan-200" /> Une stack, des leviers</span><span>v1.0 / Le Shift</span></div>
          </div>
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-7 max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-cyan-200">Un répertoire, plusieurs univers</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tout ce qui fait gagner du temps.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Explorez les projets open source, lisez les instructions officielles, puis choisissez ce que vous souhaitez installer.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resourceTypes.map(({ name, description, Icon }, index) => (
            <div key={name} className="glass-panel resource-card rounded-2xl p-5 reveal-up" style={{ animationDelay: (index * 0.08) + 's' }}>
              <Icon size={20} className="mb-5 text-cyan-100" /><h3 className="font-medium">{name}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-violet-200">Sélection du répertoire</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Commencez par ces ressources.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Chaque fiche renvoie vers un dépôt public pour vérifier les instructions, la licence et les prérequis.</p></div>
          <Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-cyan-100">Parcourir le catalogue <ArrowRight size={15} /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{featured.slice(0, 3).map(skill => <SkillCard key={skill.id} skill={skill} />)}</div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-cyan-200/10 bg-cyan-200/[.025] p-6 sm:flex-row sm:items-center">
          <div><p className="font-medium">Vous avez un dépôt utile à ajouter ?</p><p className="mt-1 text-sm text-zinc-500">Proposez une ressource. Elle sera examinée avant publication.</p></div>
          <Link href="/proposer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm hover:border-cyan-200/25 hover:bg-white/[.035]">Proposer une ressource <ArrowUpRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
