'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, BookOpen, Command, Compass, LayoutDashboard, Menu, Sparkles, X } from 'lucide-react';

const links = [
  { href: '/catalogue', label: 'Explorer', icon: Compass },
  { href: '/diagnostic', label: 'Diagnostic IA', icon: Sparkles },
  { href: '/packs', label: 'Packs', icon: BookOpen },
  { href: '/playbook', label: 'Playbook', icon: Command },
  { href: '/dashboard', label: 'Mon espace', icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#09070f]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <Link href="/" aria-label="LeSHIFT — accueil" onClick={() => setOpen(false)} className="group flex shrink-0 items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-violet-200/25 bg-gradient-to-br from-violet-300/20 via-violet-500/10 to-fuchsia-300/10 text-lg font-semibold text-violet-100 shadow-[0_0_26px_rgba(139,92,246,.12)] transition group-hover:border-violet-200/50">
            <span className="absolute inset-0 bg-gradient-to-br from-white/[.09] to-transparent" />
            <span className="relative">L<span className="text-violet-300">.</span></span>
          </span>
          <span className="leading-tight">
            <span className="block text-[16px] font-semibold tracking-[-.035em] text-white">LeSHIFT</span>
            <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[.2em] text-zinc-500 sm:block">Intelligence, in motion</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 xl:flex">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={isActive(href) ? 'page' : undefined}
              className={'rounded-xl px-3.5 py-2.5 text-[13px] transition duration-200 ' + (isActive(href) ? 'bg-violet-300/[.10] text-violet-100' : 'text-zinc-400 hover:bg-white/[.04] hover:text-white')}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/admin" className="hidden items-center gap-2 rounded-xl border border-white/[.09] px-3.5 py-2.5 text-xs text-zinc-300 transition hover:border-violet-200/25 hover:bg-white/[.04] md:inline-flex">
            Console <ArrowUpRight size={13} className="text-violet-200" />
          </Link>
          <Link href="/diagnostic" className="neon-button hidden items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold sm:inline-flex">
            Trouver mon potentiel <ArrowUpRight size={14} />
          </Link>
          <button type="button" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.025] text-zinc-200 transition hover:border-violet-200/25 xl:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && <div className="border-t border-white/[.07] bg-[#0b0912]/98 px-4 pb-5 pt-3 shadow-2xl xl:hidden">
        <nav aria-label="Navigation mobile" className="mx-auto grid max-w-3xl gap-1 sm:grid-cols-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? 'page' : undefined}
              className={'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm transition ' + (isActive(href) ? 'bg-violet-300/[.10] text-violet-100' : 'text-zinc-300 hover:bg-white/[.04]')}>
              <Icon size={16} className="text-violet-200" /> <span className="flex-1">{label}</span>{isActive(href) && <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-zinc-300 hover:bg-white/[.04] md:hidden"><LayoutDashboard size={16} className="text-violet-200" /> Console admin</Link>
          <Link href="/diagnostic" onClick={() => setOpen(false)} className="neon-button mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold sm:col-span-2">Lancer mon diagnostic <ArrowUpRight size={15} /></Link>
        </nav>
      </div>}
    </header>
  );
}
