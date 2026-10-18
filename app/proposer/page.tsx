'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-[#111114] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-indigo-300/40';
const labelClass = 'block text-sm font-medium text-zinc-300';

export default function ProposerPage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState<'Skill Claude' | 'Serveur MCP' | 'Agent IA' | 'Plugin / Extension' | 'Workflow'>('Skill Claude');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!supabase) {
      setMessage({ type: 'error', text: 'Le formulaire n’est pas encore connecté à la base de données. Réessayez après la configuration Supabase.' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from('resource_submissions').insert({
      title: title.trim(),
      url: url.trim(),
      kind,
      category: category.trim(),
      description: description.trim(),
      submitter_email: email.trim() || null,
      status: 'pending',
    });
    setBusy(false);
    if (error) {
      setMessage({ type: 'error', text: 'L’envoi a échoué. Vérifiez les champs et réessayez dans un instant.' });
      return;
    }
    setMessage({ type: 'success', text: 'Merci ! Votre proposition a bien été envoyée et attend une vérification avant publication.' });
    setTitle('');
    setUrl('');
    setKind('Skill Claude');
    setCategory('');
    setDescription('');
    setEmail('');
  }

  return <main className="relative min-h-[80vh] overflow-hidden"><div className="pointer-events-none absolute left-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-violet-500/[.08] blur-[120px]"/><section className="relative mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14"><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16}/> Retour au catalogue</Link><div className="mt-10"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-indigo-300">Contribuer au catalogue</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Une ressource à partager ?</h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">Proposez un Skill Claude, un serveur MCP, un agent, un plugin ou un workflow utile aux professionnels. Chaque proposition est vérifiée avant d’être publiée.</p></div><form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-white/[.09] bg-[#101013]/90 p-6 sm:p-8"><div><label className={labelClass} htmlFor="title">Nom de la ressource *</label><input id="title" required minLength={3} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Assistant de veille concurrentielle" className={inputClass}/></div><div className="grid gap-6 sm:grid-cols-2"><div><label className={labelClass} htmlFor="kind">Type de ressource *</label><select id="kind" value={kind} onChange={e=>setKind(e.target.value as 'Skill Claude' | 'Serveur MCP' | 'Agent IA' | 'Plugin / Extension' | 'Workflow')} className={inputClass}><option>Skill Claude</option><option>Serveur MCP</option><option>Agent IA</option><option>Plugin / Extension</option><option>Workflow</option></select></div><div><label className={labelClass} htmlFor="category">Métier / catégorie *</label><input id="category" required minLength={2} maxLength={80} value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex. Marketing & SEO" className={inputClass}/></div></div><div><label className={labelClass} htmlFor="url">Lien officiel *</label><input id="url" type="url" required pattern="https?://.+" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…" className={inputClass}/><p className="mt-2 text-xs text-zinc-600">Utilisez de préférence le site officiel ou le dépôt de l’éditeur.</p></div><div><label className={labelClass} htmlFor="description">Description et cas d’usage *</label><textarea id="description" required minLength={20} maxLength={1500} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Que fait cette ressource, pour qui et quel problème résout-elle ?" className={inputClass}/><p className="mt-2 text-right text-xs text-zinc-600">{description.length}/1500</p></div><div><label className={labelClass} htmlFor="email">Votre e-mail <span className="font-normal text-zinc-500">(facultatif)</span></label><input id="email" type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.com" className={inputClass}/></div>{message && <div role="status" className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${message.type === 'success' ? 'border-emerald-300/20 bg-emerald-300/[.06] text-emerald-100' : 'border-rose-300/20 bg-rose-300/[.06] text-rose-100'}`}>{message.type === 'success' && <CheckCircle2 size={18} className="mt-1 shrink-0"/>}<p>{message.text}</p></div>}<button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Envoi en cours…' : 'Envoyer la proposition'} <Send size={16}/></button><p className="text-xs leading-5 text-zinc-600">L’envoi ne publie pas automatiquement la ressource. Les propositions sont enregistrées en attente de modération.</p></form><div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/[.08] p-5"><div><p className="text-sm font-medium">Vous cherchez plutôt une ressource ?</p><p className="mt-1 text-xs text-zinc-500">Parcourez les outils déjà référencés.</p></div><Link href="/catalogue" className="inline-flex shrink-0 items-center gap-2 text-sm text-indigo-200 hover:text-white">Catalogue <ArrowUpRight size={15}/></Link></div></section></main>;
}
