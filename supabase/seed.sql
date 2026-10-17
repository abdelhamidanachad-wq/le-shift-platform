-- Optional demo data. Rows are published for preview purposes.
-- Replace these examples with verified listings before opening the marketplace.
insert into public.skills
  (slug, title, description, category, kind, impact, time_saved, price_label, price_amount, currency, tag, accent, status, featured)
values
  ('copilote-audit-financier', 'Copilote d’audit financier', 'Structure les contrôles, repère les incohérences et prépare une synthèse exploitable.', 'Finance', 'Skill Claude', 'Productivité', '4 h / dossier', '29 €', 29.00, 'EUR', 'Populaire', 'from-violet-500/25', 'published', true),
  ('radar-seo-concurrentiel', 'Radar SEO concurrentiel', 'Transforme les observations concurrentielles en opportunités de contenu priorisées.', 'Marketing', 'Serveur MCP', 'Croissance', '3 h / semaine', 'À partir de 19 €', 19.00, 'EUR', 'Tendance', 'from-sky-500/25', 'published', true),
  ('brief-strategique-express', 'Brief stratégique express', 'Passe d’un brief incomplet à un plan d’action clair, structuré et prêt à partager.', 'Marketing', 'Skill Claude', 'Productivité', '2 h / brief', 'Gratuit', 0.00, 'EUR', 'Essentiel', 'from-fuchsia-500/25', 'published', true),
  ('crm-enrichment-mcp', 'CRM Enrichment MCP', 'Réduit la saisie manuelle et harmonise les données prospects de votre pipeline.', 'Sales', 'Serveur MCP', 'Automatisation', '5 h / semaine', '39 €', 39.00, 'EUR', 'Nouveau', 'from-emerald-500/25', 'published', false),
  ('assistant-preselection-rh', 'Assistant de présélection RH', 'Compare les candidatures aux critères du poste avec une grille d’analyse cohérente.', 'RH', 'Skill Claude', 'Productivité', '45 min / poste', '24 €', 24.00, 'EUR', 'Pratique', 'from-amber-500/25', 'published', false),
  ('veille-marche-augmentee', 'Veille marché augmentée', 'Centralise les signaux du marché et livre une note de veille synthétique.', 'Stratégie', 'Serveur MCP', 'Décision', '1 journée / mois', '49 €', 49.00, 'EUR', 'Premium', 'from-indigo-500/25', 'published', false)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  kind = excluded.kind,
  impact = excluded.impact,
  time_saved = excluded.time_saved,
  price_label = excluded.price_label,
  price_amount = excluded.price_amount,
  currency = excluded.currency,
  tag = excluded.tag,
  accent = excluded.accent,
  status = excluded.status,
  featured = excluded.featured;
