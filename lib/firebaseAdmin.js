import { initializeApp, getApps, cert } from "firebase-admin/app";

export function initFirebase() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase ENV:", {
        projectId,
        clientEmail,
        privateKeyExists: !!privateKey,
      });
      throw new Error("Missing Firebase environment variables");
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}