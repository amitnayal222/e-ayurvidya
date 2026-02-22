// components/QRCodeModal.js
"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { setDoc, addDoc, serverTimestamp,collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QRCodeModal({ folderId, userId, value,title,price, refId, onClose }) {
  const [status, setStatus] = useState("pending"); // pending / approved / userPaid

  // Early return if required props are missing
  if (!folderId || !userId) return null;

  // Real-time listener for this user's pending purchase
  useEffect(() => {
  if (!folderId || !userId) return;
  if (!userId) return; 
  const purchaseRef = doc(db, "pendingPurchases", `${userId}_${folderId}`);

  const unsubscribe = onSnapshot(purchaseRef, (docSnap) => {
    if (!docSnap.exists()) {
         setStatus("pending");
      	 return;
        }
    const data = docSnap.data();
    setStatus(data.status || "pending");
  },
	  (err) => {
    console.error("Purchase snapshot error:", err);
    setStatus("pending"); // fallback
  }
  );

  return () => unsubscribe();
}, [folderId, userId, onClose]);

  // Optional: user marks as paid manually
  const handleIPaid = async () => {
  try {
	  await setDoc(
	  doc(db, "pendingPurchases", `${userId}_${folderId}`),
    {
      userId,
      folderId,
      refId,
      price,
      status: "userPaid",
      createdAt: serverTimestamp(),
    },
   { merge: true }
    );

    alert("Payment submitted for approval");
    onClose();
	     
  } catch (error) {
    console.error(error);
    alert("Failed to mark payment. Try again.");
  }
};

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Scan QR to Pay</h3>
        <p>Ref ID: <strong>{refId || "N/A"}</strong></p>
        <QRCodeSVG value={value || ""} size={180} />
        <p style={{ marginTop: 12, fontWeight: 600 }}>
          Status: {status === "pending" ? "Scan & Pay" : status === "userPaid" ? "Waiting Admin" : "Approved ✅"}
        </p>

        {status === "pending" && (
          <button style={iPaidBtn} onClick={handleIPaid}>I Paid</button>
        )}

        <button style={closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
};

const modal = {
  background: "#fff",
  padding: 28,
  borderRadius: 16,
  textAlign: "center",
  width: "90%",
  maxWidth: 360,
  boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
};

const closeBtn = {
  marginTop: 12,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const iPaidBtn = {
  marginTop: 12,
  border: "none",
  background: "#0ea5e9",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

