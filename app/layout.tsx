import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import AmbientEffects from '@/components/ambient-effects';

export const metadata: Metadata = {
  title: 'Le Shift — Votre avantage déloyal',
  description: 'Le répertoire des Claude Skills, serveurs MCP, agents IA, plugins et workflows open source.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><AmbientEffects /><Navbar />{children}<footer className="border-t border-white/[.08] px-6 py-8 text-center text-xs text-zinc-500"><span className="text-zinc-300">Le Shift</span> · L’intelligence au service de votre ambition. · © 2026</footer></body></html>;
}
