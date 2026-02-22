"use client";

import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar({ showLogout = true }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav style={nav}>
      {/* Brand Section */}
      <div style={brandContainer}>
        <Image
          src="/ayurvidya-logo.png"
          width={60}
          height={60}
          style={{ borderRadius: "50%" }}
          alt="AyurVidya Logo"
        />
        <div style={brandText}>
          <h1 style={brandName}>
            <span style={{ color: "#10b981" }}>e-</span>
            <span style={{ color: "#0ea5e9" }}>Ayur</span>
            <span style={{ color: "#f59e0b" }}>Vidya</span>
          </h1>
          <p style={tagline}>Your digital Ayurveda notes</p>
        </div>
      </div>

      {/* Logout Button */}
      {showLogout && (
        <button style={logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}

/* ---------------- STYLES ---------------- */

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap", // allows wrapping on small screens
  padding: "12px 24px",
  background: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  borderRadius: 12,
  marginBottom: 32,
};

const brandContainer = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: "1 1 auto", // grow and shrink on small screens
};

const brandText = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0, // prevents overflow on small screens
};

const brandName = {
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.1,
};

const tagline = {
  color: "#6b7280",
  fontSize: 14,
  marginTop: 2,
  fontWeight: 500,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis", // ensures tagline doesn’t break on small screens
};

const logoutBtn = {
  background: "#0ea5e9",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
  transition: "all 0.2s",
  flexShrink: 0, // prevents button from shrinking
};

logoutBtn.hover = {
  background: "#0ca3d9",
};

