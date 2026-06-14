import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request, { params }: { params: Promise<{ domain: string }> }) {
  try {
    const { domain } = await params;
    const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');
    
    const docRef = doc(db, 'sites', safeDomain);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return new Response(data.code, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      return new Response('<h1>404 - Site Not Found</h1><p>This site has not been published or does not exist.</p>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error('Fetch Site Error:', error);
    return new Response('<h1>500 - Internal Server Error</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
