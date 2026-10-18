'use client';
import { useEffect, useState } from 'react';

const KEY='le_shift_privacy_consent_v1';
export default function PrivacyConsent(){
 const [choice,setChoice]=useState<string|null>(null);
 const [open,setOpen]=useState(false);
 useEffect(()=>{setChoice(localStorage.getItem(KEY));},[]);
 function choose(value:'accepted'|'rejected'){localStorage.setItem(KEY,value);setChoice(value);setOpen(false);window.dispatchEvent(new CustomEvent('le-shift-consent-change',{detail:value}));}
 if(choice&&!open)return <button onClick={()=>setOpen(true)} className="fixed bottom-3 right-3 z-[99] rounded-full border border-white/15 bg-[#101013]/95 px-3 py-2 text-xs text-zinc-300 shadow-xl">Confidentialité</button>;
 return <aside className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#101013]/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-5" role="dialog" aria-label="Préférences de confidentialité"><p className="text-sm font-semibold">Votre confidentialité compte</p><p className="mt-2 text-xs leading-5 text-zinc-400">Le Shift utilise des mesures d’audience anonymisées (pages consultées, durée approximative, fuseau horaire) et peut afficher des publicités. Vous pouvez accepter ou refuser ces mesures et les annonces personnalisées. Les bannières statiques restent visibles.</p><div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={()=>choose('rejected')} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-300">Refuser le suivi</button><button onClick={()=>choose('accepted')} className="rounded-xl bg-cyan-200 px-4 py-2 text-sm font-semibold text-black">Accepter</button></div></aside>;
}
