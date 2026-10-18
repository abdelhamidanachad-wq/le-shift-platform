'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { ArrowLeft, BarChart3, CreditCard, LayoutDashboard, Megaphone, Settings2, ShieldCheck, Sparkles } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Vue générale', icon: LayoutDashboard, exact: true },
  { href: '/admin?tab=growth', label: 'Analytics & publicités', icon: BarChart3, exact: false },
  { href: '/admin/commerce', label: 'Commerce & paiements', icon: CreditCard, exact: true },
  { href: '/admin/settings', label: 'Paramètres & intégrations', icon: Settings2, exact: true },
];

export default function AdminPanelLayout({ children, title = 'Control Room', description = 'Pilotez votre plateforme NEXUS.' }: PropsWithChildren<{ title?: string; description?: string }>) {
  const pathname = usePathname();

  return (
    <main className="admin-shell min-h-[85vh]">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="h-fit rounded-2xl border border-white/[.08] bg-black/20 p-4 backdrop-blur-2xl lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-white/[.08] pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/20 bg-violet-300/[.08] text-violet-100"><ShieldCheck size={18}/></span>
            <div><p className="text-sm font-semibold">NEXUS</p><p className="mt-0.5 text-[10px] uppercase tracking-[.18em] text-zinc-500">Control room</p></div>
          </div>
          <nav className="mt-4 space-y-1" aria-label="Navigation administration">
            {adminLinks.map(({ href, label, icon: Icon, exact }) => {
              const target = href.split('?')[0];
              const active = pathname === target && (exact || target !== '/admin');
              return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ' + (active ? 'border border-violet-200/15 bg-violet-300/[.09] text-violet-100' : 'border border-transparent text-zinc-400 hover:bg-white/[.035] hover:text-white')}><Icon size={16}/><span>{label}</span></Link>;
            })}
          </nav>
          <Link href="/" className="mt-5 flex items-center gap-2 border-t border-white/[.08] pt-4 text-xs text-zinc-500 transition hover:text-white"><ArrowLeft size={14}/> Retour à la plateforme</Link>
        </aside>

        <section className="min-w-0">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-violet-200"><Sparkles size={13}/> NEXUS / Admin</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p></div>
            <div className="rounded-xl border border-emerald-200/15 bg-emerald-200/[.04] px-3 py-2 text-xs text-emerald-100"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300"/>Administration</div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
