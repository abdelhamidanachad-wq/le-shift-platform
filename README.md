# Le Shift

Répertoire français de ressources IA : Claude Skills, serveurs MCP, agents IA, plugins/extensions et workflows.

## Stack
- Next.js App Router, TypeScript, Tailwind CSS, Framer Motion
- Supabase Postgres + Auth + Row Level Security
- Vercel (déploiement lié à GitHub)

## Configuration Supabase
1. Configurez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans les variables d'environnement Vercel.
2. Pour un nouveau projet, exécutez `supabase/schema.sql` dans Supabase SQL Editor.
3. La base de production associée à ce projet contient 103 liens GitHub distincts dans `public.skills`. Les licences, prérequis et tarifs doivent être vérifiés sur chaque dépôt.

## Activer le superadministrateur
1. Dans [Supabase Authentication / Users](https://supabase.com/dashboard/project/xxsyidandcqxwsbuhskp/auth/users), créez l'utilisateur `abdel@leshift.fr` avec le mot de passe choisi dans le gestionnaire de comptes.
2. Dans Supabase SQL Editor, exécutez le contenu de `supabase/assign_superadmin.sql` pour associer cet utilisateur à `public.admin_users`.
3. Connectez-vous sur `/admin`. Les opérations d'administration sont contrôlées par les politiques RLS de la base ; ne désactivez pas RLS et ne placez jamais une clé service-role dans une variable `NEXT_PUBLIC_*`.

## Fonctionnalités
- Catalogue dynamique connecté à Supabase, recherche et filtres par type
- Fiches ressource avec liens vers les dépôts publics
- Formulaire de proposition et modération
- Console admin pour créer, modifier, publier, dépublier, archiver et supprimer les ressources
- Guide d'installation pour Claude Code et les connexions MCP de ChatGPT

## Déploiement
Les modifications doivent être déployées depuis la branche `main` par le projet Vercel lié au dépôt. Vérifiez l'état du dernier déploiement dans Vercel avant d'annoncer que la version est en production.
