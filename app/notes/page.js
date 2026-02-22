"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import FolderCard from "@/components/FolderCard";

export default function NotesPage() {
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      await loadFolders();
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loadFolders = async () => {
    const snap = await getDocs(collection(db, "folders"));
    setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <div style={container}>
      {/* Navbar */}
      <Navbar />

      {/* Page Title */}
      <h2 style={pageTitle}>Digital Notes</h2>

      {/* Folders Grid */}
      <div style={grid}>
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onClick={() => router.push(`/notes/${folder.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const container = { maxWidth: 1200, margin: "auto", padding: 24, fontFamily: "Inter, sans-serif" };
const pageTitle = {
  fontSize: 24,
  fontWeight: 700,
  color: "#111827",
  marginBottom: 16,
  textAlign: "center",
};

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 };

