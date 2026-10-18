'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Sparkles, Target, Workflow, Wrench } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type FunnelStep = 'role' | 'goal' | 'tasks' | 'level' | 'style';

type FunnelState = {
  role: string;
  customRole: string;
  goals: string[];
  tasks: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  style: 'guided' | 'nocode' | 'technical';
};

type StepDefinition = {
  id: FunnelStep;
  eyebrow: string;
  title: string;
  description: string;
};

const STORAGE_KEY = 'le_shift_funnel_draft_v1';

const INITIAL_STATE: FunnelState = {
  role: '',
  customRole: '',
  goals: ['save-time'],
  tasks: ['operations', 'content'],
  level: 'beginner',
  style: 'guided',
};

const roleOptions = [
  { id: 'marketing', title: 'Marketing & communication', description: 'Contenu, campagnes, acquisition', icon: '✳' },
  { id: 'management', title: 'Direction & management', description: 'Décisions, équipes, stratégie', icon: '◈' },
  { id: 'sales', title: 'Commercial & relation client', description: 'Prospection, CRM, support', icon: '↗' },
  { id: 'operations', title: 'Opérations & automatisation', description: 'Processus, coordination, productivité', icon: '⤳' },
  { id: 'data', title: 'Data, finance & reporting', description: 'Analyse, indicateurs, prévisions', icon: '▥' },
  { id: 'tech', title: 'Tech, produit & développement', description: 'Code, APIs, systèmes', icon: '⌘' },
  { id: 'hr', title: 'RH, formation & conseil', description: 'Recrutement, accompagnement, apprentissage', icon: '◎' },
  { id: 'other', title: 'Autre métier', description: 'Je préciserai mon expertise', icon: '＋' },
];

const steps: StepDefinition[] = [
  { id: 'role', eyebrow: '01 / Profil', title: 'Quel est votre métier ?', description: 'On commence par votre réalité professionnelle. LeSHIFT adaptera les recommandations à votre expertise.' },
  { id: 'goal', eyebrow: '02 / Ambition', title: 'Quel résultat voulez-vous obtenir ?', description: 'Choisissez les ambitions qui comptent le plus pour vous.' },
  { id: 'tasks', eyebrow: '03 / Terrain', title: 'Quelles tâches voulez-vous améliorer ?', description: 'Sélectionnez les activités dans lesquelles l’IA pourrait vous aider.' },
  { id: 'level', eyebrow: '04 / Niveau', title: 'Où en êtes-vous avec l’IA ?', description: 'Il n’y a pas de mauvais niveau : le parcours s’adapte à votre expérience.' },
  { id: 'style', eyebrow: '05 / Préférences', title: 'Quel type de solution vous convient ?', description: 'Nous privilégierons des ressources compatibles avec votre façon de travailler.' },
];

const goalOptions = [
  { id: 'save-time', title: 'Gagner du temps', description: 'Réduire les tâches répétitives' },
  { id: 'quality', title: 'Améliorer la qualité', description: 'Produire des résultats plus solides' },
  { id: 'connect', title: 'Connecter mes outils', description: 'Faire circuler les données' },
  { id: 'learn', title: 'Monter en compétences', description: 'Apprendre avec une méthode' },
  { id: 'team', title: 'Faire progresser mon équipe', description: 'Structurer les usages collectifs' },
];

const taskOptions = [
  { id: 'research', title: 'Recherche & veille', description: 'Trouver, comparer, synthétiser' },
  { id: 'content', title: 'Contenu & marketing', description: 'Briefs, rédaction, campagnes' },
  { id: 'operations', title: 'Opérations & workflows', description: 'Automatiser les étapes répétitives' },
  { id: 'data', title: 'Données & reporting', description: 'Analyser et expliquer les chiffres' },
  { id: 'development', title: 'Développement & produit', description: 'Coder, tester, documenter' },
  { id: 'customer', title: 'Support & client', description: 'Répondre et organiser les demandes' },
];

const levelOptions = [
  { id: 'beginner', title: 'Je découvre', description: 'Je commence ou j’utilise l’IA ponctuellement' },
  { id: 'intermediate', title: 'Je pratique', description: 'J’utilise plusieurs outils et je veux progresser' },
  { id: 'advanced', title: 'Je structure', description: 'Je teste des automatisations, agents ou APIs' },
] as const;

const styleOptions = [
  { id: 'guided', title: 'Simple et guidé', description: 'Des outils accessibles, sans code' },
  { id: 'nocode', title: 'No-code & automatisation', description: 'Connecter les outils et automatiser des workflows' },
  { id: 'technical', title: 'Technique & personnalisable', description: 'APIs, connecteurs, code et contrôle avancé' },
] as const;

function readDraft(): FunnelState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<FunnelState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      goals: Array.isArray(parsed.goals) ? parsed.goals.filter((x): x is string => typeof x === 'string') : INITIAL_STATE.goals,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.filter((x): x is string => typeof x === 'string') : INITIAL_STATE.tasks,
    };
  } catch {
    return INITIAL_STATE;
  }
}

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

const surface = 'rounded-2xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300';
const unselected = 'border-white/[.09] bg-white/[.025] hover:border-violet-200/30 hover:bg-violet-300/[.04]';
const selected = 'border-violet-200/45 bg-violet-300/[.10] shadow-[0_0_32px_rgba(139,92,246,.09)]';

export default function DiagnosticFunnel() {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FunnelState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);

  useEffect(() => {
    setAnswers(readDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // Draft persistence is best-effort; the funnel remains usable without storage.
    }
  }, [answers, hydrated]);

  const currentStep = steps[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);
  const canContinue = useMemo(() => {
    if (currentStep.id === 'role') return Boolean(answers.role && (answers.role !== 'other' || answers.customRole.trim()));
    if (currentStep.id === 'goal') return answers.goals.length > 0;
    if (currentStep.id === 'tasks') return answers.tasks.length > 0;
    return true;
  }, [answers, currentStep.id]);

  const patchAnswers = useCallback(<K extends keyof FunnelState>(key: K, value: FunnelState[K]) => {
    setAnswers(previous => ({ ...previous, [key]: value }));
  }, []);

  const next = () => {
    if (!canContinue) return;
    setStepIndex(index => Math.min(index + 1, steps.length - 1));
  };
  const back = () => setStepIndex(index => Math.max(0, index - 1));

  const submitDraft = () => {
    const payload = {
      ...answers,
      roleLabel: answers.role === 'other' ? answers.customRole.trim() : roleOptions.find(role => role.id === answers.role)?.title ?? answers.role,
      capturedAt: new Date().toISOString(),
      funnelVersion: 2,
    };
    try {
      window.localStorage.setItem('le_shift_funnel_draft_v1', JSON.stringify(payload));
    } catch {
      // The parent result screen can continue with in-memory state in a full integration.
    }
    window.dispatchEvent(new CustomEvent('le-shift-funnel-complete', { detail: payload }));
    // Keep this component composable: parent integration decides when to advance to profile/results.
  };

  return (
    <section className="relative isolate mx-auto w-full max-w-5xl">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-[48px] bg-violet-500/[.06] blur-3xl" />
      <div className="glass-panel rounded-[28px] p-5 sm:rounded-[34px] sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-violet-300/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-100">
              <Sparkles size={13} /> Diagnostic NEXUS
            </div>
            <p className="mt-4 text-xs text-zinc-500">{currentStep.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{currentStep.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{currentStep.description}</p>
          </div>
          <div className="min-w-[88px] text-right">
            <div className="text-2xl font-semibold tabular-nums text-violet-100">{String(stepIndex + 1).padStart(2, '0')}<span className="text-zinc-600">/{steps.length}</span></div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">étape</p>
          </div>
        </div>

        <div className="mt-7" aria-label={`Progression du diagnostic : ${Math.round(progress)} %`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={`Étape ${stepIndex + 1} sur ${steps.length}`}>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
            <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-violet-500 via-violet-300 to-cyan-200 shadow-[0_0_18px_rgba(167,139,250,.45)]" animate={{ width: `${progress}%` }} transition={{ duration: reduceMotion ? 0 : .45, ease: 'easeOut' }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-zinc-500"><span>Profil</span><span>Vos recommandations</span></div>
        </div>

        <div className="mt-8 min-h-[320px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(3px)' }}
              transition={{ duration: reduceMotion ? 0 : .24, ease: 'easeOut' }}
            >
              {currentStep.id === 'role' && (
                <div>
                  <div className="mb-4 flex items-center gap-2 text-xs text-violet-100"><BriefcaseBusiness size={15} /> Votre métier en premier</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roleOptions.map(option => (
                      <button type="button" key={option.id} aria-pressed={answers.role === option.id} onClick={() => { patchAnswers('role', option.id); setShowCustomRole(option.id === 'other'); }} className={surface + ' ' + (answers.role === option.id ? selected : unselected)}>
                        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.035] text-lg text-violet-100">{option.icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{option.title}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span></span><span className={'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ' + (answers.role === option.id ? 'border-violet-200 bg-violet-200 text-black' : 'border-white/15 text-transparent')}><Check size={12}/></span></div>
                      </button>
                    ))}
                  </div>
                  {showCustomRole && answers.role === 'other' && <label className="mt-4 block text-sm text-zinc-300">Précisez votre métier ou expertise<input autoFocus value={answers.customRole} onChange={event => patchAnswers('customRole', event.target.value)} placeholder="Ex. : consultant retail marketing" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-200/45" /></label>}
                </div>
              )}

              {currentStep.id === 'goal' && <div><div className="mb-4 flex items-center gap-2 text-xs text-violet-100"><Target size={15}/> Votre ambition principale</div><div className="grid gap-3 sm:grid-cols-2">{goalOptions.map(option => { const active = answers.goals.includes(option.id); return <button type="button" key={option.id} aria-pressed={active} onClick={() => patchAnswers('goals', toggle(answers.goals, option.id))} className={surface + ' ' + (active ? selected : unselected)}><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span></button>; })}</div></div>}

              {currentStep.id === 'tasks' && <div><div className="mb-4 flex items-center gap-2 text-xs text-violet-100"><Workflow size={15}/> Vos principaux cas d’usage</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{taskOptions.map(option => { const active = answers.tasks.includes(option.id); return <button type="button" key={option.id} aria-pressed={active} onClick={() => patchAnswers('tasks', toggle(answers.tasks, option.id))} className={surface + ' ' + (active ? selected : unselected)}><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span></button>; })}</div></div>}

              {currentStep.id === 'level' && <div><div className="mb-4 flex items-center gap-2 text-xs text-violet-100"><Sparkles size={15}/> Votre expérience</div><div className="grid gap-3 sm:grid-cols-3">{levelOptions.map(option => { const active = answers.level === option.id; return <button type="button" key={option.id} aria-pressed={active} onClick={() => patchAnswers('level', option.id)} className={surface + ' ' + (active ? selected : unselected)}><span className="block text-sm font-semibold">{option.title}</span><span className="mt-2 block text-xs leading-5 text-zinc-500">{option.description}</span></button>; })}</div></div>}

              {currentStep.id === 'style' && <div><div className="mb-4 flex items-center gap-2 text-xs text-violet-100"><Wrench size={15}/> Votre préférence</div><div className="grid gap-3 sm:grid-cols-3">{styleOptions.map(option => { const active = answers.style === option.id; return <button type="button" key={option.id} aria-pressed={active} onClick={() => patchAnswers('style', option.id)} className={surface + ' ' + (active ? selected : unselected)}><span className="block text-sm font-semibold">{option.title}</span><span className="mt-2 block text-xs leading-5 text-zinc-500">{option.description}</span></button>; })}</div></div>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-white/[.08] pt-5 sm:flex-row sm:items-center">
          <button type="button" onClick={back} disabled={stepIndex === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 transition hover:bg-white/[.04] disabled:cursor-not-allowed disabled:opacity-30"><ArrowLeft size={15}/> Précédent</button>
          <div className="flex items-center justify-between gap-3 sm:justify-end"><p className="text-[11px] text-zinc-500">{canContinue ? 'Vous pourrez ajuster vos choix' : 'Choisissez une réponse pour continuer'}</p>{stepIndex < steps.length - 1 ? <button type="button" onClick={next} disabled={!canContinue} className="neon-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Continuer <ArrowRight size={15}/></button> : <button type="button" onClick={submitDraft} disabled={!canContinue} className="neon-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Voir la suite <ArrowRight size={15}/></button>}</div>
        </div>
      </div>
    </section>
  );
}
