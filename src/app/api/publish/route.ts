import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { domain, code } = await req.json();

    if (!domain || !code) {
      return NextResponse.json({ error: 'Domain and code are required' }, { status: 400 });
    }

    const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');
    
    const docRef = doc(db, 'sites', safeDomain);
    await setDoc(docRef, { code, updatedAt: new Date().toISOString() });

    return NextResponse.json({ success: true, url: `/sites/${safeDomain}` });
  } catch (error) {
    console.error('Publish API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
