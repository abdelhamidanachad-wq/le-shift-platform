'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import SkillCard from '@/components/skill-card';
import { skills, type Skill } from '@/lib/skills';
import { supabase } from '@/lib/supabase';

type CatalogueRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: 'Skill Claude' | 'Serveur MCP';
  impact: string | null;
  time_saved: string | null;
  price_amount: number | string | null;
  tag: string | null;
  status: string;
};

function mapRowToSkill(row: CatalogueRow): Skill {
  const type = row.kind === 'Serveur MCP' ? 'mcp' : 'prompt';
  return {
    id: row.slug || row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price_amount ?? 0),
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
    if (!supabase) return;
    let active = true;

    const loadPublishedSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('id, slug, title, description, category, kind, impact, time_saved, price_amount, tag, status')
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

  return <main className="min-h-[80vh]"><section className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20"><div className="mb-10 max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[.2em] text-indigo-300"><Sparkles size={14}/> Le catalogue</div><h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Trouvez votre <span className="text-gradient">prochain levier.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">Des Skills Claude et serveurs MCP sélectionnés pour répondre aux enjeux concrets des équipes ambitieuses.</p></div><div className="grid gap-7 lg:grid-cols-[230px_1fr]"><aside className="h-fit rounded-2xl border border-white/[.08] bg-[#101013] p-5"><div className="mb-5 flex items-center gap-2 font-medium"><SlidersHorizontal size={16} className="text-indigo-300"/> Affiner la sélection</div><label className="mb-2 block text-xs text-zinc-500">Métier</label><select value={category} onChange={e=>setCategory(e.target.value)} className={`${selectClass} mb-5`}>{categories.map(c=><option key={c}>{c}</option>)}</select><label className="mb-2 block text-xs text-zinc-500">Type de ressource</label><select value={type} onChange={e=>setType(e.target.value)} className={`${selectClass} mb-5`}><option value="Tous les formats">Tous les formats</option><option value="mcp">Serveur MCP</option><option value="prompt">Skill Claude</option></select><label className="mb-2 block text-xs text-zinc-500">Impact estimé</label><select value={impact} onChange={e=>setImpact(e.target.value)} className={selectClass}><option>Tous les impacts</option><option>Moins de 5 h / semaine</option><option>5 h et plus / semaine</option></select><button onClick={()=>{setSearch('');setCategory('Tous les métiers');setType('Tous les formats');setImpact('Tous les impacts')}} className="mt-4 w-full text-xs text-zinc-500 hover:text-white">Réinitialiser les filtres</button></aside><div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-sm text-zinc-400"><span className="font-semibold text-white">{filtered.length}</span> ressources sélectionnées</p><div className="relative sm:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une ressource…" className="w-full rounded-xl border border-white/10 bg-[#111114] py-3 pl-9 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-indigo-300/40"/></div></div>{filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(skill=><SkillCard key={skill.id} skill={skill}/>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center"><p className="font-medium">Aucune ressource ne correspond à ces critères.</p><p className="mt-2 text-sm text-zinc-500">Essayez d’élargir votre recherche.</p></div>}<p className="mt-6 text-xs leading-5 text-zinc-600">Les estimations de temps sont indicatives et dépendent de votre contexte d’utilisation. Les ressources affichées sont des exemples de démonstration.</p></div></div></section></main>;
}
