import { NextRequest, NextResponse } from 'next/server';

/**
 * Secure-by-default placeholder.
 *
 * Never store Stripe/PayPal/API secrets in a browser-readable Supabase row.
 * For production, connect this route to the deployment provider's secrets API
 * or a vault, and verify the authenticated superadmin on the server.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'La gestion de secrets n’est pas encore connectée. Configurez les variables dans Vercel ou branchez un coffre chiffré après vérification superadmin côté serveur.' },
    { status: 501 },
  );
}
