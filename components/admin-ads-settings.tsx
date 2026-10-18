'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ImagePlus, Megaphone, Pencil, Plus, RefreshCw, Save, Trash2, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Ad = {
  id: string; name: string; provider: 'static' | 'adsense'; placement: string; enabled: boolean;
  headline: string | null; body: string | null; image_url: string | null; destination_url: string | null;
  alt_text: string | null; adsense_client: string | null; adsense_slot: string | null;
  starts_at: string | null; ends_at: string | null; sort_order: number;
};

type Draft = Partial<Ad>;
const emptyDraft: Draft = {
  name: 'Nouvelle bannière', provider: 'static', placement: 'sitewide_top', enabled: false,
  headline: '', body: '', image_url: '', destination_url: '', alt_text: '',
  adsense_client: '', adsense_slot: '', sort_order: 0, starts_at: null, ends_at: null,
};
const field = 'mt-1 w-full rounded-xl border border-white/10 bg-[#090811] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/10';
const label = 'block text-xs font-medium uppercase tracking-wide text-zinc-400';
const placements = [
  ['sitewide_top', 'Bandeau global · sous la navigation'],
  ['catalogue_inline', 'Catalogue · entre les ressources'],
  ['resource_detail', 'Fiche ressource'],
  ['diagnostic', 'Diagnostic IA'],
  ['footer', 'Pied de page'],
] as const;

export default function AdminAdsSettings() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setError('Supabase n’est pas configuré : ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans Vercel.'); return; }
    setBusy(true);
    const { data, error: loadError } = await supabase.from('ad_placements').select('*').order('sort_order').order('created_at', { ascending: false });
    if (loadError) setError('Impossible de charger les annonces. Vérifiez la migration ads_analytics_resource_library et les droits du compte superadmin.');
    else { setAds((data ?? []) as Ad[]); setError(''); }
    setBusy(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !editing) return;
    setBusy(true); setNotice(''); setError('');
    const form = new FormData(event.currentTarget);
    const provider = String(form.get('provider') || 'static') as Ad['provider'];
    const file = form.get('banner_file');
    let imageUrl = String(form.get('image_url') || '').trim() || null;

    if (file instanceof File && file.size > 0) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setBusy(false); setError('Image invalide. Formats acceptés : JPG, PNG, WEBP ou GIF, 5 Mo maximum.'); return;
      }
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
      const path = Date.now() + '-' + safeName;
      const { error: uploadError } = await supabase.storage.from('ad-banners').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setBusy(false); setError('Upload impossible. Appliquez la migration de stockage des bannières puis réessayez.'); return;
      }
      imageUrl = supabase.storage.from('ad-banners').getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      name: String(form.get('name') || '').trim(),
      provider,
      placement: String(form.get('placement') || 'sitewide_top'),
      enabled: form.get('enabled') === 'on',
      headline: String(form.get('headline') || '').trim() || null,
      body: String(form.get('body') || '').trim() || null,
      image_url: provider === 'static' ? imageUrl : null,
      destination_url: String(form.get('destination_url') || '').trim() || null,
      alt_text: String(form.get('alt_text') || '').trim() || null,
      adsense_client: String(form.get('adsense_client') || '').trim() || null,
      adsense_slot: String(form.get('adsense_slot') || '').trim() || null,
      sort_order: Number(form.get('sort_order') || 0),
      starts_at: form.get('starts_at') ? new Date(String(form.get('starts_at'))).toISOString() : null,
      ends_at: form.get('ends_at') ? new Date(String(form.get('ends_at'))).toISOString() : null,
    };
    if (!payload.name) { setBusy(false); setError('Donnez un nom interne à cette annonce.'); return; }
    if (provider === 'static' && !payload.image_url && !payload.headline) { setBusy(false); setError('Ajoutez une image de bannière ou au minimum un titre.'); return; }
    if (provider === 'adsense' && (!/^ca-pub-\\d+$/.test(payload.adsense_client || '') || !/^\\d+$/.test(payload.adsense_slot || ''))) { setBusy(false); setError('Renseignez un identifiant éditeur ca-pub-… et un ID de bloc AdSense numérique.'); return; }

    const result = editing.id
      ? await supabase.from('ad_placements').update(payload).eq('id', editing.id)
      : await supabase.from('ad_placements').insert(payload);
    setBusy(false);
    if (result.error) { setError('Enregistrement refusé. Vérifiez votre rôle superadmin, les URL et la migration Supabase.'); return; }
    setNotice(payload.enabled ? 'Annonce enregistrée et activée.' : 'Annonce enregistrée en brouillon/inactive.');
    setEditing(null);
    await load();
  }

  async function remove(ad: Ad) {
    if (!supabase || !window.confirm('Supprimer « ' + ad.name + ' » ?')) return;
    const { error: deleteError } = await supabase.from('ad_placements').delete().eq('id', ad.id);
    if (deleteError) setError('Suppression refusée. Vérifiez les droits superadmin.');
    else { setNotice('Annonce supprimée.'); await load(); }
  }

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl border border-violet-200/15 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,.18),transparent_45%),linear-gradient(145deg,rgba(20,16,36,.98),rgba(8,8,15,.98))] p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-300/[.07] blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><span className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-violet-200/[.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-100"><Megaphone size={13}/> NEXUS · AD STUDIO</span><h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Publicités & bannières personnalisées</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Créez une campagne, importez votre visuel, choisissez les pages, programmez la diffusion et activez-la. Les annonces sont désactivées par défaut.</p></div>
        <button type="button" onClick={() => { setEditing({ ...emptyDraft }); setNotice(''); setError(''); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-violet-100"><Plus size={16}/> Nouvelle annonce</button>
      </div>
      <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><p className="text-xs text-zinc-500">Campagnes configurées</p><p className="mt-2 text-3xl font-semibold">{ads.length}</p></div>
        <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><p className="text-xs text-zinc-500">Actives</p><p className="mt-2 text-3xl font-semibold text-emerald-200">{ads.filter(ad => ad.enabled).length}</p></div>
        <div className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><p className="text-xs text-zinc-500">Google AdSense</p><p className="mt-2 text-3xl font-semibold text-cyan-100">{ads.filter(ad => ad.provider === 'adsense').length}</p></div>
      </div>
    </section>

    {(notice || error) && <p role={error ? 'alert' : 'status'} className={'rounded-xl border p-3 text-sm ' + (error ? 'border-rose-300/20 bg-rose-300/[.04] text-rose-100' : 'border-emerald-300/20 bg-emerald-300/[.04] text-emerald-100')}>{error || notice}</p>}

    {editing && <form onSubmit={save} className="grid gap-4 rounded-3xl border border-violet-200/15 bg-[#100d1b] p-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between"><div><h3 className="font-semibold">{editing.id ? 'Modifier la campagne' : 'Créer une campagne'}</h3><p className="mt-1 text-xs text-zinc-500">Choisissez un seul format par annonce.</p></div><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Fermer</button></div>
      <div><label className={label}>Nom interne</label><input name="name" required defaultValue={editing.name || ''} placeholder="Ex. Bannière partenaires juin" className={field}/></div>
      <div><label className={label}>Format publicitaire</label><select name="provider" defaultValue={editing.provider || 'static'} className={field}><option value="static">Bannière personnalisée</option><option value="adsense">Google AdSense</option></select></div>
      <div><label className={label}>Emplacement</label><select name="placement" defaultValue={editing.placement || 'sitewide_top'} className={field}>{placements.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></div>
      <div><label className={label}>Titre / accroche</label><input name="headline" defaultValue={editing.headline || ''} placeholder="Une offre qui attire l’œil" className={field}/></div>
      <div><label className={label}>Texte secondaire</label><input name="body" defaultValue={editing.body || ''} placeholder="Votre message en une phrase" className={field}/></div>
      <div><label className={label}>Lien de l’image (optionnel)</label><input name="image_url" type="url" defaultValue={editing.image_url || ''} placeholder="https://…" className={field}/></div>
      <div className="sm:col-span-2"><label className={label}>Importer une image (JPG, PNG, WEBP, GIF · 5 Mo max.)</label><input name="banner_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={field}/><p className="mt-1 text-[11px] text-zinc-600">L’image importée remplace le lien d’image ci-dessus. Préférez un format horizontal 3:1 ou 4:1 pour un bandeau.</p></div>
      <div><label className={label}>URL de destination</label><input name="destination_url" type="url" defaultValue={editing.destination_url || ''} placeholder="https://…" className={field}/></div>
      <div><label className={label}>Texte alternatif</label><input name="alt_text" defaultValue={editing.alt_text || ''} placeholder="Décrivez le visuel" className={field}/></div>
      <div><label className={label}>Identifiant AdSense</label><input name="adsense_client" defaultValue={editing.adsense_client || ''} placeholder="ca-pub-0000000000000000" className={field}/></div>
      <div><label className={label}>ID du bloc AdSense</label><input name="adsense_slot" defaultValue={editing.adsense_slot || ''} placeholder="1234567890" className={field}/></div>
      <div><label className={label}>Priorité d’affichage</label><input name="sort_order" type="number" defaultValue={editing.sort_order ?? 0} className={field}/></div>
      <div><label className={label}>Début de diffusion</label><input name="starts_at" type="datetime-local" defaultValue={editing.starts_at ? new Date(editing.starts_at).toISOString().slice(0,16) : ''} className={field}/></div>
      <div><label className={label}>Fin de diffusion</label><input name="ends_at" type="datetime-local" defaultValue={editing.ends_at ? new Date(editing.ends_at).toISOString().slice(0,16) : ''} className={field}/></div>
      <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" name="enabled" defaultChecked={editing.enabled}/> Activer immédiatement</label>
      {(editing.image_url || editing.headline) && editing.provider !== 'adsense' && <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-3"><p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Aperçu du visuel actuel</p>{editing.image_url ? <img src={editing.image_url} alt={editing.alt_text || 'Aperçu de bannière'} className="max-h-40 w-full rounded-xl object-cover"/> : <p className="py-8 text-center text-lg font-semibold">{editing.headline}</p>}</div>}
      <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-violet-200 px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"><Save size={15}/>{busy ? 'Enregistrement…' : 'Enregistrer la campagne'}</button><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-4 py-3 text-sm">Annuler</button></div>
    </form>}

    <section className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Toutes les campagnes</h3><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs" disabled={busy}><RefreshCw size={13}/> Actualiser</button></div>
      {ads.map(ad => <article key={ad.id} className="group flex flex-col gap-4 rounded-2xl border border-white/[.08] bg-white/[.02] p-4 transition hover:border-violet-200/20 sm:flex-row sm:items-center">
        {ad.image_url && ad.provider === 'static' ? <img src={ad.image_url} alt={ad.alt_text || ''} className="h-20 w-full rounded-xl object-cover sm:w-36"/> : <div className="flex h-20 w-full items-center justify-center rounded-xl border border-white/10 bg-violet-300/[.05] text-violet-100 sm:w-36">{ad.provider === 'adsense' ? 'AdSense' : <ImagePlus size={20}/>}</div>}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-medium">{ad.name}</h4><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">{ad.provider === 'adsense' ? 'Google AdSense' : 'Bannière personnalisée'}</span><span className={'rounded-full px-2 py-1 text-[10px] ' + (ad.enabled ? 'bg-emerald-300/10 text-emerald-200' : 'bg-zinc-700/70 text-zinc-300')}>{ad.enabled ? 'Activée' : 'Inactive'}</span></div><p className="mt-1 truncate text-sm text-zinc-400">{ad.headline || ad.body || 'Sans accroche'} · {placements.find(([value]) => value === ad.placement)?.[1] || ad.placement}</p><p className="mt-1 text-xs text-zinc-600">{ad.starts_at ? 'Début : ' + new Date(ad.starts_at).toLocaleString('fr-FR') : 'Dès activation'}{ad.ends_at ? ' · Fin : ' + new Date(ad.ends_at).toLocaleString('fr-FR') : ''}</p></div>
        <div className="flex gap-2"><button onClick={() => { setEditing({ ...ad }); setNotice(''); setError(''); }} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/[.04]"><Pencil size={13}/> Modifier</button><button onClick={() => void remove(ad)} aria-label={'Supprimer ' + ad.name} className="rounded-lg border border-rose-300/15 p-2 text-rose-200 hover:bg-rose-300/[.06]"><Trash2 size={14}/></button></div>
      </article>)}
      {!ads.length && !busy && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><Megaphone size={24} className="mx-auto text-zinc-500"/><p className="mt-3 font-medium">Aucune annonce configurée</p><p className="mt-1 text-sm text-zinc-500">Créez une bannière ou un bloc AdSense, puis activez-la pour la faire apparaître sur le site.</p><button onClick={() => setEditing({ ...emptyDraft })} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-200/20 px-4 py-2.5 text-sm text-violet-100"><Plus size={14}/> Créer ma première annonce</button></div>}
    </section>
    <p className="text-xs leading-5 text-zinc-600">Important : les annonces AdSense ne s’afficheront que si le compte est approuvé par Google, que les IDs sont valides et que le visiteur a accepté les cookies publicitaires. Les bannières personnalisées peuvent s’afficher sans AdSense, selon le consentement applicable à votre configuration.</p>
  </div>;
}
