import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type LemonEvent = {
  meta?: { event_name?: string; custom_data?: Record<string, unknown> };
  data?: { id?: string; type?: string; attributes?: Record<string, any> };
};

function validSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !serviceKey) {
    return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') || '';
  if (!signature || !validSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: LemonEvent;
  try { event = JSON.parse(rawBody) as LemonEvent; }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const attributes = event.data?.attributes || {};
  const eventName = event.meta?.event_name || '';
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = String(attributes.user_email || attributes.customer_email || '').toLowerCase() || null;
  const orderId = String(event.data?.id || '');
  const firstItem = attributes.first_order_item || {};
  const productId = String(firstItem.product_id || firstItem.variant_id || attributes.product_id || attributes.variant_id || 'unknown');
  const productTitle = String(firstItem.product_name || attributes.product_name || attributes.product_title || 'Le Shift digital resource');
  const totalCents = Number(attributes.total ?? attributes.total_formatted?.replace(/[^0-9.]/g, '') ?? 0);
  const amount = attributes.total !== undefined ? totalCents / 100 : Number(totalCents || 0);
  const currency = String(attributes.currency || 'EUR').toUpperCase();

  if (eventName === 'order_created' || eventName === 'order_refunded') {
    const status = eventName === 'order_refunded' ? 'refunded' : 'paid';
    const { error } = await admin.from('orders').upsert({
      customer_email: email,
      product_type: 'skill',
      product_id: productId,
      product_title: productTitle,
      amount,
      currency,
      payment_provider: 'lemon_squeezy',
      provider_order_id: orderId || null,
      status,
      metadata: { event_name: eventName, order_number: attributes.order_number ?? null, user_id: event.meta?.custom_data?.user_id ?? null },
      paid_at: status === 'paid' ? (attributes.created_at || new Date().toISOString()) : null,
    }, { onConflict: 'provider_order_id' });
    if (error) return NextResponse.json({ error: 'Could not record order.' }, { status: 500 });
  }

  if (eventName.startsWith('subscription_')) {
    const subscriptionStatus = eventName === 'subscription_cancelled' ? 'cancelled'
      : eventName === 'subscription_expired' ? 'expired'
      : eventName === 'subscription_payment_failed' ? 'past_due'
      : eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'subscription_payment_success' ? 'active' : null;
    if (subscriptionStatus) {
      const subscriptionId = String(event.data?.id || attributes.subscription_id || '');
      const { error } = await admin.from('subscriptions').upsert({
        customer_email: email || 'unknown',
        plan_slug: String(attributes.variant_id || attributes.product_id || 'subscription'),
        plan_name: String(attributes.product_name || 'Le Shift Premium'),
        payment_provider: 'lemon_squeezy',
        provider_subscription_id: subscriptionId || null,
        status: subscriptionStatus,
        current_period_end: attributes.renews_at || attributes.ends_at || null,
        cancel_at_period_end: Boolean(attributes.cancelled),
      }, { onConflict: 'provider_subscription_id' });
      if (error) return NextResponse.json({ error: 'Could not record subscription.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
