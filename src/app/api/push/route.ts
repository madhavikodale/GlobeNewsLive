import { NextResponse } from 'next/server';
import * as webpush from 'web-push';

// VAPID keys should be set in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@globenews.live';

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// In-memory store for subscriptions (use Redis/DB in production)
const subscriptions = new Map<string, webpush.PushSubscription>();

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key for client subscription
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'vapid-public-key') {
    if (!VAPID_PUBLIC_KEY) {
      return NextResponse.json(
        { error: 'VAPID not configured' },
        { status: 500 }
      );
    }
    return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
  }

  return NextResponse.json({ 
    subscriptions: subscriptions.size,
    vapidConfigured: !!VAPID_PUBLIC_KEY 
  });
}

/**
 * POST /api/push/subscribe
 * Save a new push subscription
 */
export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Store subscription (keyed by endpoint)
    subscriptions.set(subscription.endpoint, subscription);

    console.log(`[Push] New subscription: ${subscription.endpoint.substring(0, 50)}...`);
    console.log(`[Push] Total subscriptions: ${subscriptions.size}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully' 
    });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/unsubscribe
 * Remove a push subscription
 */
export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const deleted = subscriptions.delete(endpoint);

    console.log(`[Push] Unsubscribe: ${endpoint.substring(0, 50)}...`);
    console.log(`[Push] Total subscriptions: ${subscriptions.size}`);

    return NextResponse.json({ 
      success: deleted, 
      message: deleted ? 'Unsubscribed successfully' : 'Subscription not found' 
    });
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to send push notification to all subscribers
 * This can be called from other API routes when critical alerts occur
 */
export async function sendPushNotification(payload: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID not configured, skipping push');
    return { sent: 0, failed: 0 };
  }

  const results = { sent: 0, failed: 0 };
  const notificationPayload = JSON.stringify(payload);

  for (const [endpoint, subscription] of subscriptions) {
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      results.sent++;
    } catch (error) {
      console.error(`[Push] Failed to send to ${endpoint.substring(0, 50)}:`, error);
      
      // Remove invalid subscriptions
      if ((error as webpush.WebPushError).statusCode === 410) {
        subscriptions.delete(endpoint);
        console.log(`[Push] Removed invalid subscription`);
      }
      
      results.failed++;
    }
  }

  console.log(`[Push] Notification sent: ${results.sent} success, ${results.failed} failed`);
  return results;
}

// Re-export for use in other routes
export { subscriptions };
