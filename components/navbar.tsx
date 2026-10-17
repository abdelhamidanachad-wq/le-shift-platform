import Link from 'next/link';

const links = [{ href: '/catalogue', label: 'Le Catalogue' }, { href: '/playbook', label: 'Le Playbook' }];

export default function Navbar() {
  return <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#09090b]/80 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400/20 to-violet-500/10 text-lg font-semibold text-indigo-200">L<span className="text-violet-300">.</span></span><span className="text-[17px] font-semibold tracking-tight">Le Shift</span></Link><nav className="hidden items-center gap-8 md:flex">{links.map(link => <Link key={link.href} href={link.href} className="text-sm text-zinc-400 transition hover:text-white">{link.label}</Link>)}</nav><Link href="/catalogue" className="rounded-full border border-white/15 bg-white/[.06] px-4 py-2.5 text-sm font-medium transition hover:border-indigo-300/40 hover:bg-white/10">Accéder au catalogue <span className="ml-1 text-indigo-300">↗</span></Link></div></header>;
}
