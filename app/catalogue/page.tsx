'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import SkillCard from '@/components/skill-card';
import AdSlots from '@/components/ad-slots';
import { skills, type Skill } from '@/lib/skills';
import { supabase } from '@/lib/supabase';

type CatalogueRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: 'Skill Claude' | 'Serveur MCP' | 'Agent IA' | 'Plugin / Extension' | 'Workflow';
  impact: string | null;
  time_saved: string | null;
  price_amount: number | string | null;
  price_label: string | null;
  tag: string | null;
  status: string;
};

function mapRowToSkill(row: CatalogueRow): Skill {
  const type = row.kind === 'Serveur MCP' ? 'mcp' : row.kind === 'Agent IA' ? 'agent' : row.kind === 'Plugin / Extension' ? 'plugin' : row.kind === 'Workflow' ? 'workflow' : 'prompt';
  return {
    id: row.slug || row.id,
    databaseId: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price_amount ?? 0),
    priceLabel: row.price_label ?? 'À vérifier',
    expected_roi: row.time_saved ?? 'À découvrir',
    type,
    timeSaved: row.time_saved ?? 'À découvrir',
    tag: row.tag ?? row.impact ?? (type === 'mcp' ? 'Serveur MCP' : 'Skill Claude'),
    icon: type === 'mcp' ? '⌁' : '✳',
  };
}

export default function CataloguePage() {
  const [catalogueSkills, setCatalogueSkills] = useState<Skill[]>(skills);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous les métiers');
  const [type, setType] = useState('Tous les formats');
  const [impact, setImpact] = useState('Tous les impacts');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    const loadPublishedSkills = async () => {
      const { data, error } = await client
        .from('skills')
        .select('id, slug, title, description, category, kind, impact, time_saved, price_amount, price_label, tag, status')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!active || error || !data || data.length === 0) return;
      setCatalogueSkills((data as CatalogueRow[]).map(mapRowToSkill));
    };

    void loadPublishedSkills();
    return () => {
      active = false;
    };
  }, []);

  const categories = ['Tous les métiers', ...Array.from(new Set(catalogueSkills.map(skill => skill.category)))];
  const filtered = useMemo(() => catalogueSkills.filter(skill => {
    const matchesSearch = `${skill.title} ${skill.description} ${skill.category}`.toLowerCase().includes(search.toLowerCase());
    const hours = Number.parseInt(skill.timeSaved, 10);
    return matchesSearch
      && (category === 'Tous les métiers' || skill.category === category)
      && (type === 'Tous les formats' || skill.type === type)
      && (impact === 'Tous les impacts' || (impact === '5 h et plus / semaine' ? hours >= 5 : hours < 5));
  }), [catalogueSkills, search, category, type, impact]);

  const selectClass = 'w-full rounded-xl border border-white/10 bg-[#111114] px-3 py-3 text-sm text-zinc-300 outline-none focus:border-indigo-300/40';

  return <main className="min-h-[80vh]"><section className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20"><div className="mb-10 grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end"><div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-violet-300/[.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-100"><Sparkles size={13}/> NEXUS / Répertoire intelligent</div><h1 className="text-4xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-6xl">Trouvez le bon levier. <span className="text-gradient">Pas juste un outil de plus.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">Explorez les skills, connecteurs MCP, agents et workflows par usage métier. Chaque ressource vous aide à comprendre la valeur avant de l’intégrer à votre stack.</p></div><div className="grid grid-cols-2 gap-4 border-t border-white/[.08] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"><div><p className="text-3xl font-semibold tracking-tight tabular-nums">{catalogueSkills.length}</p><p className="mt-1 text-xs text-zinc-500">Ressources dans cette vue</p></div><div><p className="text-3xl font-semibold tracking-tight">05</p><p className="mt-1 text-xs text-zinc-500">Formats à explorer</p></div><p className="col-span-2 max-w-xs text-xs leading-5 text-zinc-500">Utilisez les filtres pour réduire le bruit et trouver une ressource adaptée à votre prochain objectif.</p></div></div><AdSlots placement="catalogue_inline"/><div className="grid gap-7 lg:grid-cols-[230px_1fr]"><aside className="h-fit rounded-2xl border border-white/[.08] bg-[#101013] p-5"><div className="mb-5 flex items-center gap-2 font-medium"><SlidersHorizontal size={16} className="text-indigo-300"/> Affiner la sélection</div><label className="mb-2 block text-xs text-zinc-500">Métier</label><select value={category} onChange={e=>setCategory(e.target.value)} className={`${selectClass} mb-5`}>{categories.map(c=><option key={c}>{c}</option>)}</select><label className="mb-2 block text-xs text-zinc-500">Type de ressource</label><select value={type} onChange={e=>setType(e.target.value)} className={`${selectClass} mb-5`}><option value="Tous les formats">Tous les formats</option><option value="mcp">Serveur MCP</option><option value="prompt">Skill Claude</option><option value="agent">Agent IA</option><option value="plugin">Plugin / Extension</option><option value="workflow">Workflow</option></select><label className="mb-2 block text-xs text-zinc-500">Impact estimé</label><select value={impact} onChange={e=>setImpact(e.target.value)} className={selectClass}><option>Tous les impacts</option><option>Moins de 5 h / semaine</option><option>5 h et plus / semaine</option></select><button onClick={()=>{setSearch('');setCategory('Tous les métiers');setType('Tous les formats');setImpact('Tous les impacts')}} className="mt-4 w-full text-xs text-zinc-500 hover:text-white">Réinitialiser les filtres</button></aside><div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-sm text-zinc-400"><span className="font-semibold text-white">{filtered.length}</span> ressources sélectionnées</p><div className="relative sm:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une ressource…" className="w-full rounded-xl border border-white/10 bg-[#111114] py-3 pl-9 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-indigo-300/40"/></div></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(skill=><SkillCard key={skill.id} skill={skill}/>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center"><p className="font-medium">Aucune ressource ne correspond à ces critères.</p><p className="mt-2 text-sm text-zinc-500">Essayez d’élargir votre recherche.</p></div>}<p className="mt-6 text-xs leading-5 text-zinc-600">Les estimations de temps sont indicatives et dépendent de votre contexte d’utilisation. Les fiches renvoient vers des dépôts GitHub publics. Vérifiez les prérequis, compatibilités, licences et tarifs dans chaque dépôt.</p></div></div></section></main>;
}
