'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bot, Braces, Check, Compass, GitFork, Layers3, ShieldCheck, Sparkles, Workflow, Zap } from 'lucide-react';
import SkillCard from '@/components/skill-card';
import { skills as fallbackSkills, type Skill } from '@/lib/skills';
import { supabase } from '@/lib/supabase';

type Row = {
  id: string; slug: string; title: string; description: string; category: string;
  kind: string; time_saved: string | null; price_amount: number | string | null;
  price_label: string | null; tag: string | null; impact: string | null; status: string;
};
function mapRow(row: Row): Skill {
  const type: Skill['type'] = row.kind === 'Serveur MCP' ? 'mcp' : row.kind === 'Agent IA' ? 'agent' : row.kind === 'Plugin / Extension' ? 'plugin' : row.kind === 'Workflow' ? 'workflow' : 'prompt';
  return { id: row.slug || row.id, title: row.title, description: row.description, category: row.category, price: Number(row.price_amount || 0), priceLabel: row.price_label || 'À vérifier', expected_roi: row.time_saved || 'À évaluer', type, timeSaved: row.time_saved || 'À évaluer', tag: row.tag || row.impact || row.kind, icon: type === 'mcp' ? '⌁' : type === 'agent' ? '◉' : type === 'plugin' ? '⟡' : type === 'workflow' ? '⟳' : '✳' };
}
const pillars = [
  { n: '01', title: 'Comprendre votre potentiel', description: 'Un diagnostic guidé transforme vos objectifs et vos habitudes en une carte claire de vos compétences.', icon: Compass },
  { n: '02', title: 'Découvrir ce qui vous correspond', description: 'Des ressources sélectionnées par usage, métier et niveau — pas une liste infinie d’outils.', icon: Sparkles },
  { n: '03', title: 'Passer de l’idée à l’action', description: 'Des repères concrets pour tester, connecter et intégrer l’IA dans votre quotidien.', icon: Workflow },
];
const resourceTypes = [
  { name: 'Skills', description: 'Des méthodes réutilisables pour mieux travailler avec l’IA.', Icon: Sparkles, color: 'from-violet-300/20 to-violet-500/5' },
  { name: 'Serveurs MCP', description: 'Reliez vos assistants aux outils et données utiles.', Icon: Braces, color: 'from-fuchsia-300/15 to-violet-500/5' },
  { name: 'Agents IA', description: 'Orchestrez des tâches, avec des limites et contrôles clairs.', Icon: Bot, color: 'from-indigo-300/20 to-violet-500/5' },
  { name: 'Workflows', description: 'Connectez les étapes répétitives de vos processus.', Icon: Layers3, color: 'from-purple-300/20 to-violet-500/5' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Skill[]>(fallbackSkills.slice(0, 3));
  const [total, setTotal] = useState(103);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.from('skills').select('id,slug,title,description,category,kind,time_saved,price_amount,price_label,tag,impact,status').eq('status', 'published').order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(6).then(({ data }) => { if (active && data?.length) setFeatured((data as Row[]).map(mapRow)); });
    void supabase.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'published').then(({ count }) => { if (active && typeof count === 'number') setTotal(count); });
    return () => { active = false; };
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="site-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />
      <section className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:px-12 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
          <div className="reveal-up relative z-10">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-violet-200/15 bg-violet-300/[.06] px-3.5 py-2 text-[11px] font-medium tracking-wide text-violet-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-300 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-violet-300" /></span>
              VOTRE ESPACE D’INTELLIGENCE IA <ArrowUpRight size={13} />
            </div>
            <h1 className="glitch max-w-3xl text-[clamp(2.9rem,6.4vw,6rem)] font-semibold leading-[.99] tracking-[-.065em]">
              L’IA n’est pas un outil de plus. <span className="text-gradient">C’est votre prochain levier.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              LeSHIFT vous aide à comprendre votre potentiel, trouver les bons skills et agents, puis les transformer en résultats concrets — sans vous perdre dans le bruit.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostic" className="neon-button inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">
                Cartographier mon potentiel <ArrowRight size={16} />
              </Link>
              <Link href="/catalogue" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/[.11] bg-white/[.025] px-5 py-3.5 text-sm text-zinc-200 transition hover:border-violet-200/25 hover:bg-white/[.045]">
                Explorer le catalogue <Compass size={15} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-violet-200" /> Sources vérifiables</span>
              <span className="inline-flex items-center gap-2"><GitFork size={14} className="text-violet-200" /> Ressources sélectionnées</span>
              <span className="inline-flex items-center gap-2"><Zap size={14} className="text-violet-200" /> Diagnostic guidé</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="nexus-ambient-glow pointer-events-none absolute -inset-10 rounded-full bg-violet-500/[.09] blur-[80px]" />
            <div className="neon-frame nexus-hero-panel glass-panel relative rounded-[28px] p-4 sm:rounded-[32px] sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[.08] pb-4">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-300/[.08] text-violet-100"><Sparkles size={15}/></span><div><p className="text-xs font-semibold tracking-wide">NEXUS / INTELLIGENCE MAP</p><p className="mt-1 text-[10px] text-zinc-500">Un aperçu de l’expérience LeSHIFT</p></div></div>
                <span className="rounded-full border border-white/[.09] px-2.5 py-1 text-[9px] uppercase tracking-[.16em] text-zinc-400">Aperçu</span>
              </div>
              <div className="grid items-center gap-4 py-5 sm:grid-cols-[1fr_.88fr] sm:gap-2 sm:py-7">
                <div className="relative mx-auto aspect-square w-full max-w-[290px]">
                  <div className="nexus-ring absolute inset-[7%] rounded-full border border-violet-200/[.10]" />
                  <div className="nexus-ring absolute inset-[20%] rounded-full border border-violet-200/[.13]" />
                  <div className="absolute inset-[33%] rounded-full border border-violet-200/[.16]" />
                  <div className="absolute inset-[7%] rounded-full bg-violet-500/[.035] shadow-[0_0_80px_rgba(139,92,246,.13)]" />
                  <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full" aria-label="Illustration d'une carte de compétences">
                    <defs><linearGradient id="nexusLine" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4b5fd" stopOpacity=".85"/><stop offset="100%" stopColor="#7c3aed" stopOpacity=".18"/></linearGradient><radialGradient id="nexusCore"><stop offset="0%" stopColor="#c4b5fd" stopOpacity=".42"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity=".02"/></radialGradient></defs>
                    <circle cx="150" cy="150" r="48" fill="url(#nexusCore)"/>
                    <g stroke="url(#nexusLine)" strokeWidth="1.2" fill="none"><path d="M150 150 L150 28 L230 75 L267 174 L180 256 L62 218 L34 112 L150 150"/><path d="M150 28 L267 174 M230 75 L62 218 M34 112 L180 256"/><path d="M150 150 L230 75 M150 150 L267 174 M150 150 L180 256 M150 150 L62 218 M150 150 L34 112"/></g>
                    <g fill="#c4b5fd" stroke="#100c1c" strokeWidth="4"><circle cx="150" cy="28" r="5"/><circle cx="230" cy="75" r="5"/><circle cx="267" cy="174" r="5"/><circle cx="180" cy="256" r="5"/><circle cx="62" cy="218" r="5"/><circle cx="34" cy="112" r="5"/></g>
                    <circle cx="150" cy="150" r="25" fill="#18102a" stroke="#c4b5fd" strokeOpacity=".7"/><circle cx="150" cy="150" r="13" fill="#a78bfa" fillOpacity=".75"/><circle cx="150" cy="150" r="4" fill="#fff"/>
                  </svg>
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-lg border border-violet-200/15 bg-[#151020]/95 px-2.5 py-1.5 text-[10px] text-violet-100 shadow-lg">Compétences</div>
                  <div className="absolute right-0 top-[43%] rounded-lg border border-violet-200/15 bg-[#151020]/95 px-2.5 py-1.5 text-[10px] text-violet-100 shadow-lg">Outils IA</div>
                  <div className="absolute bottom-[1%] left-[9%] rounded-lg border border-violet-200/15 bg-[#151020]/95 px-2.5 py-1.5 text-[10px] text-violet-100 shadow-lg">Workflows</div>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/[.10] text-violet-100"><Compass size={17}/></span><div><p className="text-xs font-medium">01 · Comprendre</p><p className="mt-1 text-[10px] text-zinc-500">Votre profil et vos objectifs</p></div></div></div>
                  <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/[.10] text-violet-100"><Sparkles size={17}/></span><div><p className="text-xs font-medium">02 · Découvrir</p><p className="mt-1 text-[10px] text-zinc-500">Les ressources adaptées</p></div></div></div>
                  <div className="rounded-2xl border border-violet-200/[.18] bg-violet-300/[.055] p-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/[.12] text-violet-100"><Zap size={17}/></span><div><p className="text-xs font-medium">03 · Passer à l’action</p><p className="mt-1 text-[10px] text-zinc-400">Une prochaine étape concrète</p></div></div></div>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/[.08] pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-[11px] text-zinc-500">Votre potentiel ne se résume pas à un score.</p><Link href="/diagnostic" className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-100 transition hover:text-white">Lancer le diagnostic <ArrowUpRight size={13}/></Link></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-y border-white/[.07] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[.18em] text-zinc-500">L’intelligence, sans le bruit</p>
          <div className="grid grid-cols-2 gap-x-7 gap-y-3 sm:flex sm:flex-wrap sm:gap-8">
            {[['01','Des sources vérifiables'],['02','Une sélection par usage'],['03','Un parcours guidé'],['04','Vos choix, votre rythme']].map(([n,label])=><div key={n} className="flex items-center gap-2.5"><span className="text-[10px] text-violet-300">{n}</span><span className="text-xs text-zinc-400">{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-14 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200">Votre écosystème IA</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Les outils que vous utilisez. Ceux que vous allez découvrir.</h2></div><Link href="/modeles" className="inline-flex items-center gap-2 text-sm text-violet-100 hover:text-white">Explorer les modèles <ArrowRight size={14}/></Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[
          {name:'ChatGPT',maker:'OpenAI',logo:'https://cdn.simpleicons.org/openai/FFFFFF'},
          {name:'Claude',maker:'Anthropic',logo:'https://cdn.simpleicons.org/anthropic/FFFFFF'},
          {name:'Gemini',maker:'Google',logo:'https://cdn.simpleicons.org/googlegemini/FFFFFF'},
          {name:'Le Chat',maker:'Mistral AI',logo:'https://cdn.simpleicons.org/mistralai/FFFFFF'},
          {name:'Hugging Face',maker:'Modèles ouverts',logo:'https://cdn.simpleicons.org/huggingface/FFFFFF'},
          {name:'Ollama',maker:'IA locale',logo:'https://cdn.simpleicons.org/ollama/FFFFFF'}
        ].map(tool=><Link key={tool.name} href="/modeles" className="nexus-card glass-panel group flex min-h-[116px] flex-col items-center justify-center rounded-2xl p-4 text-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.035] transition group-hover:border-violet-200/25"><img src={tool.logo} alt={tool.name+' logo'} loading="lazy" className="h-6 w-6 object-contain"/></span><span className="mt-3 text-sm font-semibold">{tool.name}</span><span className="mt-1 text-[10px] text-zinc-500">{tool.maker}</span></Link>)}</div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mb-8 max-w-2xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200">Votre trajectoire</p><h2 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">De la curiosité à la maîtrise.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Un chemin lisible pour passer du « je devrais utiliser l’IA » à « je sais quoi utiliser et pourquoi ».</p></div>
        <div className="grid gap-0 border-y border-white/[.08] md:grid-cols-3 md:divide-x md:divide-white/[.08]">
          {pillars.map(({n,title,description,icon:Icon})=><article key={n} className="group py-6 md:px-6 md:py-8 first:md:pl-0 last:md:pr-0"><div className="mb-7 flex items-center justify-between"><span className="text-xs text-zinc-600">{n} / 03</span><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-300/[.06] text-violet-100 transition group-hover:bg-violet-300/[.12]"><Icon size={18}/></span></div><h3 className="text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">{description}</p></article>)}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200">Le répertoire</p><h2 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Des leviers concrets, pas du bruit.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Découvrez les formats d’IA utiles, leurs usages et leurs sources.</p></div><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-violet-100">Explorer les {total} ressources <ArrowRight size={15}/></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{resourceTypes.map(({name,description,Icon,color})=><Link href="/catalogue" key={name} className="glass-panel resource-card nexus-card group rounded-2xl p-5"><span className={'mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.08] bg-gradient-to-br '+color+' text-violet-100'}><Icon size={20}/></span><h3 className="font-medium">{name}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p><span className="mt-5 inline-flex items-center gap-1.5 text-xs text-violet-100">Explorer <ArrowRight size={13} className="transition group-hover:translate-x-1"/></span></Link>)}</div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200">Sélection du moment</p><h2 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Commencez avec une bonne base.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Chaque fiche vous aide à comprendre l’usage, puis renvoie vers les sources pour vérifier les prérequis et la licence.</p></div><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-violet-100">Voir tout le catalogue <ArrowRight size={15}/></Link></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{featured.slice(0,3).map(skill=><SkillCard key={skill.id} skill={skill}/>)}</div>
        <div className="mt-10 overflow-hidden rounded-[28px] border border-violet-200/[.15] bg-gradient-to-br from-violet-400/[.10] via-[#120e1d] to-fuchsia-400/[.04] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-200">Le premier pas</p><h2 className="text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Arrêtez de deviner. Découvrez votre prochain levier.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Répondez à quelques questions, visualisez vos points forts et repartez avec une direction plus claire.</p></div>
          <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0"><Link href="/diagnostic" className="neon-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">Faire mon diagnostic <ArrowRight size={15}/></Link><Link href="/packs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3.5 text-sm text-zinc-200 hover:bg-white/[.04]">Voir les packs <ArrowUpRight size={15}/></Link></div>
        </div>
      </section>
    </main>
  );
}
