import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Stripe not configured.' }, { status: 500 });
    }
    
    // @ts-expect-error - The user prompt specifically requested this old API version
    const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

    // Validate the Origin header against trusted pattern (same-domain or localhost)
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    let validatedOrigin = '';
    
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host === host || originUrl.hostname === 'localhost' || originUrl.hostname.endsWith('.vercel.app')) {
        validatedOrigin = origin;
      }
    }
    
    if (!validatedOrigin) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Product',
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${validatedOrigin}/success`,
      cancel_url: `${validatedOrigin}/cancel`,
    });

    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Checkout session creation failed' }, { status: 500 });
  }
}

