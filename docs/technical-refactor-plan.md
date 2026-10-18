# LeSHIFT / NEXUS — stratégie technique

## État actuel confirmé

- Next.js 14 App Router, React 18 et TypeScript.
- Tailwind CSS, lucide-react et Framer Motion déjà installés : ne pas ajouter GSAP avant de démontrer un besoin non couvert.
- Supabase JS pour le catalogue, les diagnostics, les statistiques et les emplacements publicitaires.
- Le questionnaire est aujourd’hui implémenté dans `app/diagnostic/page.tsx`; il commence par les objectifs et demande le rôle plus tard.
- Les publicités ont déjà un module dans `components/admin-growth.tsx`, avec bannières statiques et AdSense.
- Le commerce existant est dans `app/admin/commerce/page.tsx` et le webhook Lemon Squeezy utilise des variables d’environnement serveur.

## Architecture recommandée

```
app/
  diagnostic/page.tsx                # page orchestratrice / résultat
  admin/page.tsx                      # ressources et onglets existants
  admin/commerce/page.tsx             # commerce existant
  admin/settings/page.tsx             # nouveaux paramètres (UI sécurisée par défaut)
  api/admin/integrations/route.ts     # endpoint serveur, refuse par défaut jusqu’au branchement vault
components/
  diagnostic-funnel.tsx              # composant de questionnaire animé
  admin-panel-layout.tsx             # shell commun aux écrans admin
  admin-growth.tsx                   # publicités + analytics existantes
lib/
  validation/funnel.ts               # à ajouter lorsque le schéma métier sera stabilisé
  server/secrets.ts                  # à ajouter pour coffre chiffré / Vercel API
supabase/migrations/
  ...                                # policies dédiées, tables config sans valeurs secrètes
```

## État du funnel

Garder l’ensemble des réponses dans un seul objet typé `FunnelState`. L’étape visible reste un index distinct. Les interactions modifient l’objet via un helper `patchAnswers`, et chaque étape ne gère pas un morceau indépendant d’état. Persister uniquement une version de brouillon non sensible dans `localStorage` si l’utilisateur accepte; ne pas y stocker e-mail ou secrets. Lors du branchement final, le parent compose les réponses et appelle le mécanisme existant de score, recommandations et soumission.

Ordre recommandé : métier → objectif → tâches → niveau → style de travail → quiz existant → estimation → profil/e-mail (facultatif selon le résultat souhaité). Progression toujours basée sur le nombre total d’étapes et les validations par étape.

## UI & motion

- Framer Motion + `AnimatePresence mode="wait"` pour transitions d’écran ; ne pas animer une liste entière en boucle.
- Les halos, le verre dépoli, les dégradés et la grille sont CSS. Framer Motion sert uniquement aux transitions/interactions.
- Respecter `prefers-reduced-motion`, limiter le blur animé et les filtres de grande surface sur les mobiles.
- Social proof : afficher uniquement des partenaires et témoignages approuvés et vérifiables ; ne pas inventer de logos/citations.
- Community : liens réels vers la communauté, retours, propositions de ressources et profils de contributeurs avec consentement.
- Accessibilité : clavier, focus visible, aria-pressed, libellés de progression, pas d’état indiqué par la couleur seule.

## Publicité

Réutiliser `components/admin-growth.tsx` et la table `ad_placements`. Les scripts publicitaires arbitraires ne doivent pas être injectés par un champ texte Admin. Autoriser les fournisseurs explicitement (AdSense uniquement en config structurée) ou maintenir des bannières statiques via upload dans Supabase Storage avec validation MIME, taille et URL.

## Paramètres API et paiement

Le navigateur ne doit jamais recevoir de secret Stripe, PayPal, OpenAI, Supabase service-role ou webhook. Le formulaire admin doit appeler un endpoint serveur authentifié; cet endpoint vérifie le rôle superadmin côté serveur et écrit dans un gestionnaire de secrets (Vercel env / vault). Le navigateur ne transmet la valeur qu’une fois, sans qu’elle soit renvoyée dans une réponse, aucun log ne doit inclure la valeur. Un simple CRUD Supabase n’est pas un coffre à secrets.

## Déploiement

1. Exécuter `npm run build` et les tests.
2. Vérifier le funnel, navigation clavier, mobile et réduction du mouvement.
3. Valider les politiques RLS et le contrôle d’accès superadmin.
4. Tester ads consent / impression / clic, upload image et suppression.
5. Déployer sur Vercel et confirmer la build avant d’annoncer la mise en production.

## Points d’intégration à faire ensuite

Le composant de funnel est une première implémentation autonome. Le raccorder au quiz existant nécessite de déplacer l’étape « objectifs » existante après « métier », sans dupliquer la fonction `submit`, le calcul de score ou les appels Supabase. Les paramètres secrets restent volontairement désactivés jusqu’à l’implémentation du backend et de son autorisation serveur.
