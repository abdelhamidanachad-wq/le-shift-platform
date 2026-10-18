'use client';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/telemetry';

type AdPlacement = {
  id: string; name: string; provider: 'static'|'adsense'; placement: string; enabled: boolean;
  headline: string|null; body: string|null; image_url: string|null; destination_url: string|null; alt_text: string|null;
  adsense_client: string|null; adsense_slot: string|null; sort_order: number;
};
declare global { interface Window { adsbygoogle?: Record<string, unknown>[] } }

export default function AdSlots({ placement }: { placement: AdPlacement['placement'] }) {
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [consent, setConsent] = useState(false);
  useEffect(() => { const sync = () => setConsent(localStorage.getItem('le_shift_privacy_consent_v1') === 'accepted'); sync(); const onConsent = (event: Event) => setConsent((event as CustomEvent).detail === 'accepted'); window.addEventListener('le-shift-consent-change', onConsent); return () => window.removeEventListener('le-shift-consent-change', onConsent); }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.from('ad_placements').select('*').eq('enabled', true).eq('placement', placement).order('sort_order').then(({data}) => {
      if (active && data) { setAds(data as AdPlacement[]); for (const ad of data as AdPlacement[]) if (ad.provider === 'static') void trackEvent('ad_impression', window.location.pathname, 0, {placement, ad_id:ad.id, provider:'static'}); }
    });
    return () => { active = false; };
  }, [placement]);

  return <div className="mx-auto my-5 w-full max-w-7xl space-y-3 px-5 sm:px-8" aria-label="Espaces publicitaires">
    {ads.map(ad => {
      const validAdsense = ad.provider === 'adsense' && /^ca-pub-\d+$/.test(ad.adsense_client || '') && /^\d+$/.test(ad.adsense_slot || '');
      if (ad.provider === 'adsense' && !consent) return null;
      return <div key={ad.id} className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.025]">
        {validAdsense ? <AdsenseUnit ad={ad} /> : ad.provider === 'static' && ad.image_url ? <a href={ad.destination_url || '#'} target={ad.destination_url ? '_blank' : undefined} rel={ad.destination_url ? 'sponsored noopener noreferrer' : undefined} onClick={() => { void trackEvent('ad_click', window.location.pathname, 0, {placement, ad_id:ad.id}); }} className="block">
          {/* The image URL is editable by the administrator. */}
          <img src={ad.image_url} alt={ad.alt_text || ad.headline || ad.name} className="max-h-48 w-full object-cover sm:max-h-56" loading="lazy"/>
          {(ad.headline || ad.body) && <span className="block p-4"><span className="block text-sm font-semibold">{ad.headline || ad.name}</span>{ad.body && <span className="mt-1 block text-sm text-zinc-400">{ad.body}</span>}</span>}
        </a> : <div className="p-4"><p className="text-sm font-semibold">{ad.headline || ad.name}</p>{ad.body && <p className="mt-1 text-sm text-zinc-400">{ad.body}</p>}{ad.destination_url && <a href={ad.destination_url} target="_blank" rel="sponsored noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-200">En savoir plus <ExternalLink size={12}/></a>}</div>}
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-1 text-[9px] uppercase tracking-wider text-zinc-300">Publicité</span>
      </div>;
    })}
  </div>;
}

function AdsenseUnit({ad}:{ad:AdPlacement}) {
  useEffect(() => {
    const client = ad.adsense_client;
    if (!client || !ad.adsense_slot) return;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script'); script.async = true; script.crossOrigin = 'anonymous'; script.src = src; document.head.appendChild(script);
    }
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      void trackEvent('ad_impression', window.location.pathname, 0, {placement:ad.placement, ad_id:ad.id, provider:'adsense'});
    } catch { /* Ad blockers and unapproved slots are expected to fail quietly. */ }
  }, [ad.id, ad.adsense_client, ad.adsense_slot, ad.placement]);
  return <div className="min-h-24 p-3"><ins className="adsbygoogle block" style={{display:'block'}} data-ad-client={ad.adsense_client || ''} data-ad-slot={ad.adsense_slot || ''} data-ad-format="auto" data-full-width-responsive="true"/><p className="mt-1 text-center text-[10px] text-zinc-600">{ad.headline || ad.name}</p></div>;
}
