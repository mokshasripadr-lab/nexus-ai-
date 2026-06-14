import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "nexus-ai-web-project-01",
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.firestore();
