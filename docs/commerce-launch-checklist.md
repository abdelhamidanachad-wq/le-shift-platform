# Le Shift — commercial launch checklist

## Payment provider
Recommended initial provider: Lemon Squeezy, subject to merchant-country approval and account verification. It supports card checkout and payouts to a bank account or verified PayPal account. Buyers' card acceptance and the seller's payout route are separate settings.

1. Create and verify a Lemon Squeezy merchant account.
2. Create a product for each paid Skill/MCP and each pack; configure one-time or recurring billing.
3. In the Le Shift admin, open **Catalogue** and enter the hosted checkout URL on each paid resource. Open **Commerce & croissance → Packs & paiement** and set price, billing interval, checkout URL and status.
4. In Lemon Squeezy, create a webhook pointed at `https://le-shift-platform.vercel.app/api/webhooks/lemonsqueezy`. Subscribe to order created/refunded and subscription created/updated/cancelled/expired/payment events. Copy the webhook signing secret.
5. Configure these Vercel Production environment variables, then redeploy:
   - `LEMON_SQUEEZY_WEBHOOK_SECRET` — webhook signing secret
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only Supabase service-role key; NEVER prefix with `NEXT_PUBLIC_`
   - `SUPABASE_URL` — project API URL (or use existing `NEXT_PUBLIC_SUPABASE_URL`)
   - `CRON_SECRET` — long random secret used by the weekly discovery job
   - `GITHUB_TOKEN` — optional fine-grained token to increase GitHub API rate limits
6. Set the seller payout method inside Lemon Squeezy to a verified bank account or PayPal account. Confirm payout eligibility for the legal business country before launch.
7. Test a sandbox/test-mode order and webhook delivery before taking real payments. Confirm an order appears in the admin only after the signed webhook is received.

## Weekly resource discovery
Vercel Cron calls `/api/cron/weekly-resource-watch` every Monday. The endpoint requires `Authorization: Bearer $CRON_SECRET` and uses the server-only Supabase key. It searches public GitHub repositories and stores reviewable suggestions. It does not scrape competitor websites; competitor watch sources remain an editorial watchlist until a separate approved crawler is configured.

## Sales and compliance before launch
- Publish terms of sale, privacy policy, refund policy and contact details.
- Explain that savings estimates are indicative, not guaranteed.
- Check each resource's licence and commercial redistribution rights. Do not resell third-party open-source code or assets unless the licence allows it; sell curation, original guides, implementation support or original bundles where permitted.
- Add a customer account/download entitlement flow before selling files that require private delivery. This version supports hosted checkout URLs and records verified provider events, but does not yet provide a private digital-file delivery library.
