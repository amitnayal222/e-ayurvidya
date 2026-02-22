"use client";

import { initializeApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDujFdiCQI-2fNDST7jRkBXW6ucXwvqa5E",
  authDomain: "ayurvidya-31d79.firebaseapp.com",
  projectId: "ayurvidya-31d79",
  appId: "1:517222423569:web:806c68d0fc796514fea5b0",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);