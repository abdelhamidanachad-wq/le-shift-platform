import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import AmbientEffects from '@/components/ambient-effects';
import SiteAnalytics from '@/components/site-analytics';
import AdSlots from '@/components/ad-slots';
import PrivacyConsent from '@/components/privacy-consent';

export const metadata: Metadata = {\n  applicationName: 'LeSHIFT',\n  themeColor: '#08070d',
  title: 'LeSHIFT — Intelligence, in motion',
  description: 'Cartographiez votre potentiel IA, découvrez les bons skills, agents et workflows, puis transformez-les en résultats concrets. LeSHIFT — Intelligence, in motion.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><AmbientEffects /><SiteAnalytics /><Navbar /><AdSlots placement="sitewide_top" />{children}<AdSlots placement="footer" /><footer className="border-t border-white/[.08] px-6 py-8 text-center text-xs text-zinc-500"><span className="text-zinc-300">Le Shift</span> · L’intelligence au service de votre ambition. · © 2026</footer><PrivacyConsent /></body></html>;
}
