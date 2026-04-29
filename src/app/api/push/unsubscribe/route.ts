import { NextResponse } from 'next/server';
import { subscriptions } from '../route';

/**
 * POST /api/push/unsubscribe
 * Remove a push subscription
 */
export async function POST(request: Request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const existed = subscriptions.has(endpoint);
    subscriptions.delete(endpoint);

    console.log(`[Push] Unsubscribed: ${subscriptions.size} remaining`);

    return NextResponse.json({
      success: true,
      message: existed ? 'Unsubscribed successfully' : 'Subscription not found'
    });
  } catch (error) {
    console.error('[Push] Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
