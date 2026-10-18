'use client';

import { FormEvent, useState } from 'react';
import { KeyRound, LockKeyhole, Save, ShieldAlert, ShieldCheck } from 'lucide-react';
import AdminPanelLayout from '@/components/admin-panel-layout';

const inputClass = 'w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-200/45';
const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400';

const integrations = [
  { id: 'stripe', name: 'Stripe', publicKey: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', secretKey: 'STRIPE_SECRET_KEY', help: 'Paiement par carte et abonnements. Le secret ne sera jamais renvoyé au navigateur.' },
  { id: 'paypal', name: 'PayPal', publicKey: 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', secretKey: 'PAYPAL_CLIENT_SECRET', help: 'Le Client ID est public ; le Client Secret doit rester serveur uniquement.' },
  { id: 'openai', name: 'OpenAI / LLM', publicKey: '', secretKey: 'OPENAI_API_KEY', help: 'Utilisez une route API serveur pour tout appel au modèle.' },
  { id: 'supabase', name: 'Supabase', publicKey: 'NEXT_PUBLIC_SUPABASE_URL', secretKey: 'SUPABASE_SERVICE_ROLE_KEY', help: 'La clé service-role ne doit jamais être exposée via NEXT_PUBLIC_*.' },
  { id: 'lemonsqueezy', name: 'Lemon Squeezy (existant)', publicKey: '', secretKey: 'LEMON_SQUEEZY_WEBHOOK_SECRET', help: 'Le webhook de paiement existant lit ce secret depuis les variables d’environnement.' },
];

export default function AdminSettingsPage() {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    const form = new FormData(event.currentTarget);
    const integration = String(form.get('integration') || '');
    const value = String(form.get('value') || '').trim();

    if (!integration || !value) {
      setNotice('Choisissez une intégration et saisissez une valeur avant de continuer.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ integration, value }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Enregistrement impossible');
      setNotice('Valeur transmise au gestionnaire de secrets. Vérifiez la console de déploiement pour confirmer sa configuration.');
      (event.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Configuration non disponible.');
    } finally {
      setBusy(false);
    }
  }

  return <AdminPanelLayout title="Paramètres & intégrations" description="Centralisez les fournisseurs, vérifiez leur état et gardez les secrets hors du navigateur.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map(item => <article key={item.id} className="glass-panel rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-300/[.06] text-violet-100"><KeyRound size={18}/></div><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">Serveur uniquement</span></div>
        <h2 className="mt-4 text-lg font-semibold">{item.name}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{item.help}</p>
        <div className="mt-4 space-y-1.5 text-[11px] text-zinc-500"><p>Variable secrète : <code className="text-zinc-300">{item.secretKey}</code></p>{item.publicKey && <p>Identifiant public : <code className="text-zinc-300">{item.publicKey}</code></p>}</div>
      </article>)}
    </div>

    <section className="glass-panel mt-5 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/15 bg-amber-200/[.05] text-amber-100"><ShieldAlert size={18}/></span><div><h2 className="text-lg font-semibold">Configurer un secret</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Ce formulaire doit être connecté à une API admin authentifiée et à un gestionnaire de secrets. Le squelette appelle une route dédiée, qui refuse par défaut tant que sa protection n’est pas implémentée.</p></div></div>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className={labelClass} htmlFor="integration">Intégration</label><select id="integration" name="integration" required className={inputClass}><option value="">Choisir un fournisseur</option>{integrations.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><label className={labelClass} htmlFor="value">Clé / secret</label><input id="value" name="value" type="password" autoComplete="new-password" required className={inputClass} placeholder="Saisi uniquement au moment de l’enregistrement"/></div>
        <div className="sm:col-span-2"><button disabled={busy} className="neon-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"><Save size={15}/>{busy?'Enregistrement…':'Enregistrer le secret'}</button></div>
      </form>
      {notice && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-zinc-300">{notice}</p>}
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500"><LockKeyhole size={14} className="mt-0.5 shrink-0"/> Ne collez jamais de secret dans un ticket, une URL, les logs, ou un champ stocké par le client. En production, limitez l’accès à un rôle superadmin avec MFA.</p>
    </section>
  </AdminPanelLayout>;
}
