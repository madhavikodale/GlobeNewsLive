import { NextResponse } from 'next/server';
import { subscriptions, sendPushNotification } from '../route';

/**
 * POST /api/push/subscribe
 * Save a new push subscription from client
 */
export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // Validate subscription
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Store subscription
    subscriptions.set(subscription.endpoint, subscription);

    console.log(`[Push] New subscriber: ${subscriptions.size} total`);

    return NextResponse.json({ 
      success: true,
      message: 'Subscribed to push notifications'
    });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
