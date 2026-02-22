"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const btn = document.createElement("button");
      btn.innerText = "Add to Home Screen";
      btn.style.position = "fixed";
      btn.style.bottom = "20px";
      btn.style.right = "20px";
      btn.style.padding = "10px 20px";
      btn.style.backgroundColor = "#4CAF50";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.zIndex = "1000";
      document.body.appendChild(btn);

      btn.onclick = async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        btn.remove();
      };
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Notes App</h1>
      <Link href="/login">Go to Login</Link>
    </div>
  );
}

