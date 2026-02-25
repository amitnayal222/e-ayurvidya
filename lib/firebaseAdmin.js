import { initializeApp, getApps, cert } from "firebase-admin/app";

let app;

export function initFirebase() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable");
    }

    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );

    serviceAccount.private_key =
      serviceAccount.private_key.replace(/\\n/g, "\n");

    app = initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return app;
}