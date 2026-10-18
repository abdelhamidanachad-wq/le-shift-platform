'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, ExternalLink, Sparkles } from 'lucide-react';
import { skills, type Skill } from '@/lib/skills';
import { supabase } from '@/lib/supabase';

type DetailRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: 'Skill Claude' | 'Serveur MCP';
  impact: string | null;
  time_saved: string | null;
  price_label: string | null;
  price_amount: number | string | null;
  currency: string | null;
  tag: string | null;
  website_url: string | null;
  documentation_url: string | null;
  status: string;
};

type Resource = Skill & {
  priceLabel: string;
  currency: string;
  impact: string;
  websiteUrl?: string;
  documentationUrl?: string;
};

function fromDatabase(row: DetailRow): Resource {
  const type = row.kind === 'Serveur MCP' ? 'mcp' : 'prompt';
  const price = Number(row.price_amount ?? 0);
  return {
    id: row.slug || row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price,
    expected_roi: row.time_saved ?? 'À découvrir',
    type,
    timeSaved: row.time_saved ?? 'À découvrir',
    tag: row.tag ?? row.impact ?? (type === 'mcp' ? 'Serveur MCP' : 'Skill Claude'),
    icon: type === 'mcp' ? '⌁' : '✳',
    priceLabel: row.price_label || (price === 0 ? 'Gratuit' : 'Payant'),
    currency: row.currency || 'EUR',
    impact: row.impact || 'Productivité',
    websiteUrl: row.website_url || undefined,
    documentationUrl: row.documentation_url || undefined,
  };
}

function fromFallback(skill: Skill): Resource {
  return {
    ...skill,
    priceLabel: skill.price === 0 ? 'Gratuit' : 'Payant',
    currency: 'EUR',
    impact: skill.tag,
  };
}

export default function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const [resource, setResource] = useState<Resource | null>(() => {
    const local = skills.find(item => item.id === params.slug);
    return local ? fromFallback(local) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from('skills')
          .select('id, slug, title, description, category, kind, impact, time_saved, price_label, price_amount, currency, tag, website_url, documentation_url, status')
          .eq('slug', params.slug)
          .eq('status', 'published')
          .maybeSingle();
        if (active && !error && data) setResource(fromDatabase(data as DetailRow));
        else if (active && !resource) setResource(null);
      }
      if (active) setLoading(false);
    };
    void load();
    return () => { active = false; };
  // Resource is intentionally omitted: the slug is the lookup key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (loading && !resource) {
    return <main className="mx-auto min-h-[75vh] max-w-4xl px-5 py-24 text-sm text-zinc-500">Chargement de la ressource…</main>;
  }

  if (!resource) {
    return <main className="mx-auto min-h-[75vh] max-w-3xl px-5 py-20 sm:px-8"><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16}/> Retour au catalogue</Link><div className="mt-12 rounded-3xl border border-white/10 bg-[#101013] p-8 sm:p-12"><p className="text-xs uppercase tracking-[.2em] text-indigo-300">404 · Ressource introuvable</p><h1 className="mt-4 text-3xl font-semibold">Cette ressource n’est pas disponible.</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Elle a peut-être été retirée ou son lien est incorrect.</p><Link href="/catalogue" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Explorer le catalogue</Link></div></main>;
  }

  const price = resource.price === 0 ? 'Gratuit' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: resource.currency || 'EUR', maximumFractionDigits: 2 }).format(resource.price);

  return <main className="relative min-h-[80vh] overflow-hidden"><div className="pointer-events-none absolute right-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-500/[.10] blur-[120px]"/><section className="relative mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14"><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"><ArrowLeft size={16}/> Retour au catalogue</Link><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]"><div><div className="mb-5 flex flex-wrap items-center gap-2"><span className="rounded-full border border-indigo-300/20 bg-indigo-400/[.08] px-3 py-1.5 text-xs text-indigo-200">{resource.type === 'mcp' ? 'Serveur MCP' : 'Skill Claude'}</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">{resource.category}</span></div><h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{resource.title}</h1><p className="mt-6 max-w-3xl text-base leading-7 text-zinc-400">{resource.description}</p><div className="mt-9 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/[.08] bg-[#101013] p-5"><Clock3 size={18} className="text-emerald-300"/><p className="mt-4 text-xs text-zinc-500">Temps économisé estimé</p><p className="mt-1 text-lg font-semibold text-emerald-200">{resource.timeSaved}</p></div><div className="rounded-2xl border border-white/[.08] bg-[#101013] p-5"><Sparkles size={18} className="text-indigo-300"/><p className="mt-4 text-xs text-zinc-500">Bénéfice principal</p><p className="mt-1 text-lg font-semibold">{resource.impact}</p></div></div><div className="mt-10"><h2 className="text-xl font-semibold">Pourquoi l’explorer ?</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300"><li className="flex gap-3"><CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300"/>Clarifiez un cas d’usage concret avant de déployer un nouvel outil.</li><li className="flex gap-3"><CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300"/>Évaluez le gain de temps dans votre propre contexte de travail.</li><li className="flex gap-3"><CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-300"/>Vérifiez les accès, les permissions et la documentation avant utilisation.</li></ul></div></div><aside className="h-fit rounded-2xl border border-white/[.09] bg-[#101013] p-6 lg:sticky lg:top-28"><p className="text-xs uppercase tracking-[.16em] text-zinc-500">Accès à la ressource</p><p className="mt-3 text-3xl font-semibold">{price}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{resource.price === 0 ? 'Aucun prix renseigné pour cette ressource.' : 'Prix indicatif, à confirmer auprès de l’éditeur.'}</p><div className="my-6 border-t border-white/[.08]"/>{resource.websiteUrl ? <a href={resource.websiteUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">Accéder au site <ArrowUpRight size={16}/></a> : <div className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-500">Lien éditeur à renseigner</div>}{resource.documentationUrl && <a href={resource.documentationUrl} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/[.05]">Documentation <ExternalLink size={15}/></a>}<p className="mt-5 text-xs leading-5 text-zinc-600">Le Shift référence des ressources. Vérifiez les conditions, la sécurité et les tarifs auprès de leur éditeur avant toute utilisation.</p></aside></div><div className="mt-12 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-300/15 bg-indigo-400/[.05] p-6 sm:flex-row sm:items-center"><div><p className="font-medium">Vous connaissez une ressource utile ?</p><p className="mt-1 text-sm text-zinc-400">Aidez la communauté à découvrir de nouveaux leviers.</p></div><Link href="/proposer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/[.05]">Proposer une ressource <ArrowUpRight size={16}/></Link></div></section></main>;
}
