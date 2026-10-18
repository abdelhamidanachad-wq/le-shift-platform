'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import AdminPanelLayout from '@/components/admin-panel-layout';
import AdminAdsSettings from '@/components/admin-ads-settings';
import { supabase } from '@/lib/supabase';

const integrations = [
  { name: 'Google AdSense', variable: 'AdSense publisher ID + ad slot IDs', note: 'Configurez les campagnes dans le studio publicitaire ci-dessus. Google doit approuver le compte et le domaine.' },
  { name: 'Lemon Squeezy', variable: 'LEMON_SQUEEZY_WEBHOOK_SECRET', note: 'Le webhook de paiement existant lit le secret côté serveur.' },
  { name: 'OpenAI / LLM', variable: 'OPENAI_API_KEY', note: 'Les appels au modèle doivent passer par une route serveur.' },
  { name: 'Supabase', variable: 'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY', note: 'Les clés publiques sont destinées au navigateur ; la service-role key ne doit jamais être exposée.' },
  { name: 'Stripe / PayPal', variable: 'STRIPE_SECRET_KEY / PAYPAL_CLIENT_SECRET', note: 'Ajoutez ces variables uniquement si ces fournisseurs sont activés.' },
];

export default function AdminSettingsPage() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!supabase) { if (active) setChecking(false); return; }
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user || user.email?.toLowerCase() !== 'abdel@leshift.fr') {
        if (active) { setAuthorized(false); setChecking(false); }
        return;
      }
      const { data: admin, error } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
      if (active) { setAuthorized(!error && Boolean(admin?.user_id)); setChecking(false); }
    }
    void verify();
    return () => { active = false; };
  }, []);

  if (checking) return <main className="min-h-[70vh] px-5 py-24 text-center text-sm text-zinc-400">Vérification de la session superadmin…</main>;
  if (!authorized) return <main className="min-h-[70vh] px-5 py-20"><div className="glass-panel mx-auto max-w-lg rounded-3xl p-8 text-center"><LockKeyhole size={28} className="mx-auto text-violet-200"/><h1 className="mt-4 text-2xl font-semibold">Accès superadmin requis</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Connectez-vous à la console LeSHIFT avec le compte superadministrateur, puis ouvrez les paramètres.</p><Link href="/admin" className="neon-button mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">Ouvrir la console admin <ArrowLeft size={14}/></Link></div></main>;

  return <AdminPanelLayout title="Publicités & paramètres" description="Pilotez les campagnes, les bannières personnalisées et les identifiants de vos fournisseurs.">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200/15 bg-violet-300/[.07] text-violet-100"><ShieldCheck size={20}/></span><div><p className="text-xs uppercase tracking-[.18em] text-violet-200">NEXUS / SETTINGS</p><p className="mt-1 text-sm text-zinc-400">Configuration réservée au superadministrateur</p></div></div><Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[.04]"><ArrowLeft size={14}/> Retour au dashboard</Link></div>

    <AdminAdsSettings />

    <section className="mt-8 rounded-3xl border border-white/[.08] bg-white/[.02] p-5 sm:p-7">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-200/[.05] text-cyan-100"><KeyRound size={18}/></span><div><h2 className="text-xl font-semibold">Intégrations & clés API</h2><p className="mt-1 text-sm text-zinc-400">Les secrets de production se gèrent dans les variables d’environnement Vercel, jamais dans le navigateur ou une table publique.</p></div></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {integrations.map(item => <article key={item.name} className="rounded-2xl border border-white/[.08] bg-black/10 p-4"><h3 className="font-medium">{item.name}</h3><p className="mt-2 text-xs text-violet-100"><code>{item.variable}</code></p><p className="mt-2 text-sm leading-6 text-zinc-400">{item.note}</p></article>)}
      </div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-500"><LockKeyhole size={14} className="mt-0.5 shrink-0"/> Ne collez jamais de clé secrète ici. Ajoutez-la dans Vercel → Project Settings → Environment Variables, puis redéployez pour l’appliquer.</p>
      <a href="https://vercel.com/abdelhamidanachad-3113s-projects/le-shift-platform/settings/environment-variables" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200/20 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-200/[.05]">Ouvrir les variables Vercel <ExternalLink size={14}/></a>
    </section>
  </AdminPanelLayout>;
}
