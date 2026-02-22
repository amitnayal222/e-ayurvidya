// hooks/useAuth.js
"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export function useAuth(redirectTo = "/login") {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push(redirectTo);
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [redirectTo]);

  return { user, loading };
}

