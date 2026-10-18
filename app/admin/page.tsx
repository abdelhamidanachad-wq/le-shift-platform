'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ExternalLink, LogOut, Plus, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Kind = 'Skill Claude' | 'Serveur MCP' | 'Agent IA' | 'Plugin / Extension' | 'Workflow';
type Resource = {
  id: string; slug: string; title: string; description: string; category: string; kind: Kind;
  impact: string | null; time_saved: string | null; price_label: string | null; price_amount: number | null;
  currency: string | null; tag: string | null; status: 'draft' | 'published' | 'archived';
  featured: boolean; website_url: string | null; documentation_url: string | null; repository_url: string | null;
};
type Submission = { id: string; title: string; url: string; kind: Kind; category: string; description: string; submitter_email: string | null; status: 'pending' | 'approved' | 'rejected'; created_at: string };
const kinds: Kind[] = ['Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow'];
const field = 'w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50';
const label = 'mb-1.5 block text-xs font-medium text-zinc-400';

export default function AdminPage() {
  const [email,setEmail] = useState('abdel@leshift.fr');
  const [password,setPassword] = useState('');
  const [userEmail,setUserEmail] = useState<string|null>(null);
  const [resources,setResources] = useState<Resource[]>([]);
  const [submissions,setSubmissions] = useState<Submission[]>([]);
  const [tab,setTab] = useState<'resources'|'submissions'>('resources');
  const [filter,setFilter] = useState('all');
  const [search,setSearch] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [editing,setEditing] = useState<Resource|null>(null);
  const [showForm,setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setBusy(true);
    const [resourceResult,submissionResult] = await Promise.all([
      supabase.from('skills').select('*').order('created_at',{ascending:false}),
      supabase.from('resource_submissions').select('*').order('created_at',{ascending:false}),
    ]);
    if (resourceResult.error) setNotice('Impossible de charger les ressources. Vérifiez les politiques RLS Supabase.');
    else setResources((resourceResult.data ?? []) as Resource[]);
    if (!submissionResult.error) setSubmissions((submissionResult.data ?? []) as Submission[]);
    setBusy(false);
  },[]);

  const verifySuperadmin = useCallback(async (user: { id: string; email?: string }) => {
    if (!supabase || user.email?.toLowerCase() !== 'abdel@leshift.fr') return false;
    const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    return !error && Boolean(data?.user_id);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    void client.auth.getSession().then(async ({data}) => {
      const user = data.session?.user;
      if (!user) return;
      if (!(await verifySuperadmin(user))) {
        await client.auth.signOut();
        setNotice('Accès réservé au compte superadministrateur activé dans Supabase.');
        return;
      }
      setUserEmail(user.email ?? null);
      await load();
    });
  },[load,verifySuperadmin]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice('');
    if (!supabase) { setNotice('Supabase n’est pas configuré.'); return; }
    setBusy(true);
    const {data,error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
    setBusy(false);
    if (error || !data.user) { setNotice('Connexion refusée. Vérifiez vos identifiants et que le compte Auth existe dans Supabase.'); return; }
    if (!(await verifySuperadmin(data.user))) { await supabase.auth.signOut(); setNotice('Ce compte n’est pas encore activé comme superadministrateur dans Supabase.'); return; }
    setUserEmail(data.user.email ?? null); setPassword(''); await load();
  }

  async function logout() { if (supabase) await supabase.auth.signOut(); setUserEmail(null); setResources([]); setSubmissions([]); }

  async function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase || !editing) return;
    setBusy(true); setNotice('');
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') || '').trim();
    const repo = String(data.get('repository_url') || '').trim();
    const slug = String(data.get('slug') || '').trim().toLowerCase();
    const payload = {
      slug, title, description: String(data.get('description') || '').trim(), category: String(data.get('category') || '').trim(),
      kind: String(data.get('kind') || 'Serveur MCP'), impact: String(data.get('impact') || 'Productivité'),
      time_saved: String(data.get('time_saved') || 'À évaluer'), price_label: String(data.get('price_label') || 'À vérifier'),
      price_amount: data.get('price_amount') ? Number(data.get('price_amount')) : null, currency: 'EUR', tag: String(data.get('tag') || 'GitHub'),
      status: String(data.get('status') || 'published'), featured: data.get('featured') === 'on',
      website_url: repo || null, documentation_url: repo ? repo + '#readme' : null, repository_url: repo || null,
      compatibility: ['Claude','ChatGPT','MCP'],
    };
    const {error} = await supabase.from('skills').upsert(payload,{onConflict:'slug'});
    setBusy(false);
    if (error) { setNotice('Enregistrement impossible : vérifiez le slug, le lien et les règles Supabase.'); return; }
    setNotice('Ressource enregistrée.'); setShowForm(false); setEditing(null); await load();
  }

  async function setResourceStatus(item: Resource,status: Resource['status']) {
    if (!supabase) return;
    const {error} = await supabase.from('skills').update({status}).eq('id',item.id);
    setNotice(error ? 'La modification a échoué.' : `${item.title} : ${status}.`);
    if (!error) await load();
  }

  async function deleteResource(item: Resource) {
    if (!supabase || !window.confirm(`Supprimer « ${item.title} » ?`)) return;
    const {error} = await supabase.from('skills').delete().eq('id',item.id);
    setNotice(error ? 'Suppression impossible.' : 'Ressource supprimée.');
    if (!error) await load();
  }

  async function moderate(item: Submission,approved:boolean) {
    if (!supabase) return;
    setBusy(true); setNotice('');
    if (approved) {
      const slug = item.url.replace(/^https?:\/\//,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,100);
      const {error:insertError} = await supabase.from('skills').upsert({
        slug, title:item.title, description:item.description, category:item.category, kind:item.kind,
        impact:'À découvrir', time_saved:'À évaluer', price_label:'À vérifier', price_amount:null,
        currency:'EUR', tag:'Communauté', status:'published', featured:false, website_url:item.url,
        documentation_url:item.url, repository_url:item.url, compatibility:['Claude','ChatGPT','MCP'],
      },{onConflict:'slug'});
      if (insertError) { setBusy(false); setNotice('Publication impossible : vérifiez si la ressource existe déjà.'); return; }
    }
    const {error} = await supabase.from('resource_submissions').update({status:approved?'approved':'rejected'}).eq('id',item.id);
    setBusy(false); setNotice(error?'La modération a échoué.':approved?'Proposition publiée.':'Proposition refusée.'); await load();
  }

  const visibleResources = resources.filter(item => (filter==='all'||item.status===filter) && `${item.title} ${item.category} ${item.kind}`.toLowerCase().includes(search.toLowerCase()));
  const pending = submissions.filter(item=>item.status==='pending').length;

  if (!userEmail) return <main className="admin-shell min-h-[80vh] px-5 py-16 sm:py-24"><div className="mx-auto max-w-md"><Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={15}/> Retour au site</Link><div className="glass-panel mt-8 rounded-3xl p-7 sm:p-9"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><ShieldCheck size={22}/></div><p className="text-xs uppercase tracking-[.22em] text-cyan-200">Zone protégée</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Console Le Shift</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Connectez-vous avec le compte superadministrateur Supabase Auth.</p><form onSubmit={login} className="mt-7 space-y-4"><div><label className={label} htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className={field}/></div><div><label className={label} htmlFor="password">Mot de passe</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className={field}/></div>{notice&&<p role="status" className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-3 text-sm text-rose-200">{notice}</p>}<button disabled={busy} className="neon-button w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50">{busy?'Connexion…':'Se connecter à la console'}</button></form><p className="mt-5 text-xs leading-5 text-zinc-600">L’accès est limité à l’adresse superadministrateur configurée. Les actions sont également protégées par les politiques RLS de la base.</p></div></div></main>;

  return <main className="admin-shell min-h-[85vh] px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"><ArrowLeft size={15}/> Voir le site</Link><p className="mt-5 text-xs uppercase tracking-[.2em] text-cyan-200">Le Shift · Console</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Centre de contrôle</h1><p className="mt-2 text-sm text-zinc-400">Connecté : {userEmail}</p></div><div className="flex gap-2"><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><RefreshCw size={15}/> Actualiser</button><button onClick={()=>void logout()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><LogOut size={15}/> Déconnexion</button></div></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="glass-panel rounded-2xl p-5"><p className="text-xs text-zinc-500">Ressources totales</p><p className="mt-2 text-3xl font-semibold">{resources.length}</p></div><div className="glass-panel rounded-2xl p-5"><p className="text-xs text-zinc-500">Publiées</p><p className="mt-2 text-3xl font-semibold text-emerald-200">{resources.filter(r=>r.status==='published').length}</p></div><div className="glass-panel rounded-2xl p-5"><p className="text-xs text-zinc-500">Propositions à modérer</p><p className="mt-2 text-3xl font-semibold text-amber-200">{pending}</p></div></div>
    <div className="mt-8 flex flex-wrap items-center gap-2"><button onClick={()=>setTab('resources')} className={`rounded-xl px-4 py-2.5 text-sm ${tab==='resources'?'bg-white text-black':'border border-white/10 text-zinc-400'}`}>Catalogue</button><button onClick={()=>setTab('submissions')} className={`rounded-xl px-4 py-2.5 text-sm ${tab==='submissions'?'bg-white text-black':'border border-white/10 text-zinc-400'}`}>Propositions {pending>0&&<span className="ml-1 rounded-full bg-amber-300/20 px-1.5 text-amber-200">{pending}</span>}</button></div>
    {notice&&<p role="status" className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-sm text-cyan-100">{notice}</p>}
    {tab==='resources'?<section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c12]/80"><div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une ressource…" className={field+' sm:max-w-sm'}/><select value={filter} onChange={e=>setFilter(e.target.value)} className={field+' sm:max-w-48'}><option value="all">Tous les statuts</option><option value="published">Publiées</option><option value="draft">Brouillons</option><option value="archived">Archivées</option></select><button onClick={()=>{setEditing({id:'',slug:'',title:'',description:'',category:'Développement',kind:'Serveur MCP',impact:'Productivité',time_saved:'À évaluer',price_label:'À vérifier',price_amount:0,currency:'EUR',tag:'GitHub',status:'published',featured:false,website_url:'',documentation_url:'',repository_url:''});setShowForm(true)}} className="neon-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Plus size={15}/> Ajouter</button></div>
    {showForm&&editing&&<form onSubmit={saveResource} className="grid gap-4 border-b border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-3"><div><label className={label}>Titre</label><input name="title" required defaultValue={editing.title} className={field}/></div><div><label className={label}>Slug (unique)</label><input name="slug" required pattern="[a-z0-9-]+" defaultValue={editing.slug} className={field}/></div><div><label className={label}>Type</label><select name="kind" defaultValue={editing.kind} className={field}>{kinds.map(k=><option key={k}>{k}</option>)}</select></div><div><label className={label}>Catégorie</label><input name="category" required defaultValue={editing.category} className={field}/></div><div><label className={label}>Dépôt GitHub / URL</label><input name="repository_url" type="url" required defaultValue={editing.repository_url||''} className={field}/></div><div><label className={label}>Statut</label><select name="status" defaultValue={editing.status} className={field}><option value="published">Publié</option><option value="draft">Brouillon</option><option value="archived">Archivé</option></select></div><div className="sm:col-span-2 lg:col-span-3"><label className={label}>Description</label><textarea name="description" required minLength={20} defaultValue={editing.description} rows={3} className={field}/></div><div><label className={label}>Impact</label><input name="impact" defaultValue={editing.impact||''} className={field}/></div><div><label className={label}>Gain estimé (à vérifier)</label><input name="time_saved" defaultValue={editing.time_saved||'À évaluer'} className={field}/></div><div><label className={label}>Prix affiché</label><input name="price_label" defaultValue={editing.price_label||'À vérifier'} className={field}/></div><div><label className={label}>Prix en €</label><input name="price_amount" type="number" min="0" step=".01" defaultValue={editing.price_amount||0} className={field}/></div><div><label className={label}>Tag</label><input name="tag" defaultValue={editing.tag||'GitHub'} className={field}/></div><label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="featured" defaultChecked={editing.featured}/> Mettre en avant</label><div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button disabled={busy} className="neon-button rounded-xl px-4 py-2.5 text-sm font-semibold">Enregistrer</button><button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm">Annuler</button></div></form>}
    <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-white/[.025] text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Ressource</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{visibleResources.map(item=><tr key={item.id} className="border-t border-white/[.06]"><td className="px-4 py-4"><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-zinc-500">{item.category} · {item.slug}</p></td><td className="px-4 py-4 text-zinc-400">{item.kind}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${item.status==='published'?'bg-emerald-300/10 text-emerald-200':item.status==='draft'?'bg-amber-300/10 text-amber-200':'bg-zinc-700/50 text-zinc-300'}`}>{item.status}</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><button onClick={()=>{setEditing(item);setShowForm(true)}} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs hover:bg-white/5">Modifier</button>{item.status!=='published'&&<button onClick={()=>void setResourceStatus(item,'published')} title="Publier" className="rounded-lg border border-emerald-300/20 p-1.5 text-emerald-200"><Check size={14}/></button>}{item.status==='published'&&<button onClick={()=>void setResourceStatus(item,'draft')} title="Dépublier" className="rounded-lg border border-amber-300/20 p-1.5 text-amber-200"><X size={14}/></button>}<a href={item.repository_url||item.website_url||'#'} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 p-1.5 text-zinc-300" title="Ouvrir le dépôt"><ExternalLink size={14}/></a><button onClick={()=>void deleteResource(item)} title="Supprimer" className="rounded-lg border border-rose-300/20 p-1.5 text-rose-200"><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>{visibleResources.length===0&&<p className="p-10 text-center text-sm text-zinc-500">Aucune ressource.</p>}</div></section>:<section className="mt-5 space-y-3">{submissions.map(item=><article key={item.id} className="glass-panel rounded-2xl p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/10 px-2 py-1 text-xs text-cyan-100">{item.kind}</span><span className="text-xs text-zinc-500">{item.category}</span><span className="text-xs text-zinc-600">{item.status}</span></div><h3 className="mt-3 text-lg font-semibold">{item.title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{item.description}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white">{item.url}<ExternalLink size={14}/></a><p className="mt-2 text-xs text-zinc-600">Soumis par {item.submitter_email||'anonyme'} · {new Date(item.created_at).toLocaleDateString('fr-FR')}</p></div>{item.status==='pending'&&<div className="flex shrink-0 gap-2"><button disabled={busy} onClick={()=>void moderate(item,true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100"><Check size={15}/> Publier</button><button disabled={busy} onClick={()=>void moderate(item,false)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/15 px-3 py-2 text-sm text-rose-100"><X size={15}/> Refuser</button></div>}</div></article>)}{submissions.length===0&&<div className="glass-panel rounded-2xl p-12 text-center text-sm text-zinc-500">Aucune proposition pour le moment.</div>}</section>}
    {busy&&<p className="mt-4 text-xs text-zinc-600">Traitement en cours…</p>}</div></main>;
}
