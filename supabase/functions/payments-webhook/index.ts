import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('Received event:', event.eventType, 'env:', env);

    switch (event.eventType) {
      case EventName.SubscriptionCreated:
        await handleSubscriptionCreated(event.data, env);
        break;
      case EventName.SubscriptionUpdated:
        await handleSubscriptionUpdated(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscriptionCanceled(event.data, env);
        break;
      case EventName.SubscriptionPastDue:
        await handlePastDue(event.data, env);
        break;
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, env);
        break;
      case EventName.TransactionPaymentFailed:
        await handlePaymentFailed(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;

  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData');
    return;
  }

  const item = items[0];
  const priceId = item.price?.importMeta?.externalId || item.price?.id;
  const productId = item.product?.importMeta?.externalId || item.product?.id;

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,environment',
  });
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, items, currentBillingPeriod, scheduledChange } = data;

  const update: Record<string, any> = {
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    updated_at: new Date().toISOString(),
  };

  // Sync price_id if items present (plan change)
  if (Array.isArray(items) && items[0]) {
    const item = items[0];
    const priceId = item.price?.importMeta?.externalId || item.price?.id;
    const productId = item.product?.importMeta?.externalId || item.product?.id;
    if (priceId) update.price_id = priceId;
    if (productId) update.product_id = productId;
  }

  await supabase.from('subscriptions')
    .update(update)
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await supabase.from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

async function handlePastDue(data: any, env: PaddleEnv) {
  await supabase.from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  console.log('Transaction completed:', data.id, 'env:', env);
  try {
    const userId = data.customData?.userId
      ?? (await findUserByCustomer(data.customerId, env));
    if (!userId) return;

    const { data: userRes } = await supabase.auth.admin.getUserById(userId);
    const email = userRes?.user?.email;
    if (!email) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle();

    const item = data.items?.[0];
    const priceExternal = item?.price?.importMeta?.externalId || '';
    const planLabel = priceExternal === 'ora_premium_yearly' ? 'Ora Premium · Yearly'
      : priceExternal === 'ora_premium_monthly' ? 'Ora Premium · Monthly'
      : 'Ora Premium';
    const total = data.details?.totals?.total ?? data.payments?.[0]?.amount ?? '0';
    const currency = data.currencyCode ?? 'USD';
    const amountStr = `$${(Number(total) / 100).toFixed(2)}`;

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        to: email,
        template_name: 'receipt',
        template_data: {
          displayName: profile?.display_name ?? '',
          amount: amountStr,
          currency,
          planLabel,
          invoiceUrl: data.invoice_pdf_url ?? data.invoiceNumber ?? null,
        },
      },
    });
  } catch (e) {
    console.error('receipt email enqueue failed', e);
  }
}

async function handlePaymentFailed(data: any, env: PaddleEnv) {
  console.log('Payment failed:', data.id, 'env:', env);
  try {
    const userId = data.customData?.userId
      ?? (await findUserByCustomer(data.customerId, env));
    if (!userId) return;
    const { data: userRes } = await supabase.auth.admin.getUserById(userId);
    const email = userRes?.user?.email;
    if (!email) return;
    const { data: profile } = await supabase.from('user_profiles').select('display_name').eq('user_id', userId).maybeSingle();

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        to: email,
        template_name: 'payment_issue',
        template_data: {
          displayName: profile?.display_name ?? '',
          manageUrl: 'https://oradevotion.com/settings',
        },
      },
    });
  } catch (e) {
    console.error('payment_issue email enqueue failed', e);
  }
}

async function findUserByCustomer(customerId: string | undefined, env: PaddleEnv): Promise<string | null> {
  if (!customerId) return null;
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('paddle_customer_id', customerId)
    .eq('environment', env)
    .maybeSingle();
  return data?.user_id ?? null;
}
