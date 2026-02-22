"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function InstructionsPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 24 }}>
      <Navbar showLogout={false} />

      {/* Back Button */}
      <button style={backBtn} onClick={() => router.back()}>
        ← Back
      </button>

      <h1 style={{
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  }}>
        General Instructions
      </h1>

      {/* Mobile Installation Section */}
      <h2 style={{ marginTop: 40, marginBottom: 16 }}>
        📱 Add This App to Your Mobile Home Screen
      </h2>

      <div style={{ lineHeight: 1.8 }}>
        <h3>🤖 For Android Users (Chrome)</h3>
        <ol>
          <li>Open this website in <strong>Google Chrome</strong>.</li>
          <li>Tap the <strong>three dots (⋮)</strong> in the top-right corner.</li>
          <li>Select <strong>"Add to Home screen"</strong>.</li>
          <li>Tap <strong>"Add"</strong> to confirm.</li>
          <li>The app icon will appear on your home screen.</li>
        </ol>

        <h3 style={{ marginTop: 24 }}>🍎 For iPhone Users (Safari)</h3>
        <ol>
          <li>Open this website in <strong>Safari</strong>.</li>
          <li>Tap the <strong>Share icon</strong> (square with upward arrow).</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
          <li>Tap <strong>"Add"</strong> in the top-right corner.</li>
          <li>The app icon will now appear on your home screen.</li>
        </ol>

        <p style={{ marginTop: 16 }}>
          Once added, the app will open in full-screen mode and work like a regular mobile application.
        </p>
      </div>
    </div>
  );
}

const backBtn = {
  background: "transparent",
  border: "none",
  color: "#0ea5e9",
  fontSize: 14,
  cursor: "pointer",
  fontWeight: 600,
};

