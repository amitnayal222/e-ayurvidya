"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query,doc, where, getDocs, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import QRCodeModal from "@/components/QRCodeModal";
import { useAuth } from "@/hooks/useAuth";
import { useFolder } from "@/hooks/useFolder";

export default function FolderPage() {
  const { folderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { folder, files, loading } = useFolder(folderId, user?.uid);
  const router = useRouter();

  const [showQR, setShowQR] = useState(false);
  const [refId, setRefId] = useState("");
  const [isPending, setIsPending] = useState(false);

  // -------- Real-time listener for pending / approved purchase --------
  useEffect(() => {
    if (!user?.uid || !folderId) return;

    const purchaseRef = doc(
    db,
    "pendingPurchases",
    `${user?.uid}_${folderId}`
  );
  const unsubscribe = onSnapshot(purchaseRef, (docSnap) => {
    if (!docSnap.exists()) {
      setIsPending(false); // No purchase yet
      return;
    }
    const data = docSnap.data();
    setIsPending(data.status === "pending" || data.status === "userPaid");

  });

  return () => unsubscribe();
}, [folderId, user?.uid]);

  if (loading || authLoading) return <p style={{ padding: 24 }}>Loading…</p>;

  // -------- Buy button handler --------
  const handleBuy = async () => {
    if (!folder || folder.purchased || isPending) return;

    const rId = `${user.uid.slice(0, 6)}-${folder.id.slice(0, 6)}`;


    setRefId(rId);
    setShowQR(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 24 }}>
      <Navbar />

      {/* Back Button */}
      <button style={backBtn} onClick={() => router.push("/notes")}>← All folders</button>

      {/* Folder Header */}
      <div style={headerCard}>
        <h1 style={{ ...title, textAlign: "center" }}>{folder.title}</h1>
        {folder.description && <p style={{ ...desc, textAlign: "center" }}>{folder.description}</p>}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          {!folder.purchased && !isPending && (
            <button style={buyBtn} onClick={handleBuy}>Buy ₹{folder.price}</button>
          )}
          {!folder.purchased && isPending && (
            <button style={pendingBtn} disabled>Pending</button>
          )}
          
        </div>
      </div>

      {/* Files Grid */}
      <div style={grid}>
        {files.map(f => (
          <div
            key={f.id}
            style={fileCard}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={fileTitle}>{f.title}</h3>
            <button
              style={{
                ...fileBtn,
                background: folder.purchased ? "#16a34a" : "#9ca3af",
                cursor: folder.purchased ? "pointer" : "not-allowed",
              }}
              onClick={() => folder.purchased && router.push(`/notes/${folder.id}/file/${f.id}`)}
            >
              {folder.purchased ? "Open File" : "🔒 Locked"}
            </button>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && folder && user && refId && folder.price  && (
        <QRCodeModal
          folderId={folderId}
          userId={user.uid}
          value={`upi://pay?pa=daily1lifestyle@iob&pn=AyurVidya&am=${folder.price}&tn=${folder.title}`}
          refId={refId}
	      price={folder.price}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const backBtn = { border: "none", background: "none", color: "#16a34a", cursor: "pointer", marginBottom: 16, fontSize: 16, fontWeight: 500 };
const headerCard = { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.08)", marginBottom: 32 };
const title = { fontSize: 32, fontWeight: 700, color: "#111827" };
const desc = { color: "#6b7280", fontSize: 16 };
const buyBtn = { background: "#0ea5e9", color: "#fff", padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 16 };
const pendingBtn = { background: "#f59e0b", color: "#fff", padding: "10px 22px", borderRadius: 12, border: "none", fontWeight: 600, fontSize: 16, cursor: "not-allowed" };
const openBtn = { background: "#16a34a", color: "#fff", padding: "10px 22px", borderRadius: 12, border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 24 };
const fileCard = { background: "#fff", padding: 20, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", transition: "all 0.2s" };
const fileTitle = { fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 12 };
const fileBtn = { width: "100%", padding: 12, borderRadius: 10, border: "none", color: "#fff", fontWeight: 600, fontSize: 15, transition: "all 0.2s" };

