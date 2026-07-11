import * as admin from 'firebase-admin';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nexus-ai-56a65";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminDb = admin.firestore();

/**
 * Verifies the authorization header containing a Firebase ID token.
 * Returns the decoded token if valid, or null.
 */
export async function verifyAuth(req: Request): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

/**
 * Checks if the user is a whitelisted administrator.
 */
export function isAdmin(email?: string): boolean {
  if (!email) return false;
  const adminEmails = ['mokshasripad@gmail.com', 'mokshasripadr@gmail.com'];
  return adminEmails.includes(email.toLowerCase());
}

