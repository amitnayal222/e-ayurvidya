// /app/notes/[folderId]/file/[fileId]/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import Navbar from "@/components/Navbar";
import CanvasViewer from "@/components/CanvasViewer";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";

const checkIfPurchased = async (userId, folderId) => {
  const folderRef = doc(db, "folders", folderId);
  const folderSnap = await getDoc(folderRef);

  if (!folderSnap.exists()) return false;

  const folderData = folderSnap.data();
  const purchasedBy = folderData.purchasedBy || [];
  return purchasedBy.includes(userId); // ✅ true if user bought
};


export default function FilePage() {
  const { folderId, fileId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fileData, setFileData] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);
const [unauthorized, setUnauthorized] = useState(false);
  // Zoom state
  const [zoom, setZoom] = useState(1);

  // Fetch Firestore doc and get signed URLs
  useEffect(() => {
    if (!user) return;

    const loadFile = async () => {
      try {
      const purchased = await checkIfPurchased(user.uid, folderId);
      if (!purchased) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

        const fileSnap = await getDoc(doc(db, "folderFiles", fileId));
        if (!fileSnap.exists()) {
          router.push("/notes");
          return;
        }

        const data = fileSnap.data();
        setFileData(data);

        // Generate signed URLs for each image
        const urls = await Promise.all(
          data.imageUrls.map(async (path) => {
            const res = await fetch(`/api/s3-signed-url?key=${encodeURIComponent(path)}`);
            const json = await res.json();
            return json.url;
          })
        );

        setImageUrls(urls);
        setLoading(false);
      } catch (err) {
        console.error("Error loading file:", err);
        setLoading(false);
      }
    };

    loadFile();
  }, [user, fileId, router]);

  const handleZoom = (delta) => {
    let newZoom = zoom + delta;
    if (newZoom < 0.2) newZoom = 0.2;
    if (newZoom > 3) newZoom = 3;
    setZoom(newZoom);
  };

  if (loading || authLoading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (unauthorized) return <p style={{ padding: 24, color: "red" }}>Unauthorized: You have not purchased this folder.</p>;

  return (
	  <div
  style={{
    width: "100%",       // full width of parent / viewport
    maxWidth: 1200,      // never exceed 1200px
    height: "100vh",     // full viewport height
    margin: "0 auto",    // center horizontally if screen is wider than 1200px
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }}
>
	  <Navbar />
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: 16 }}>
	 <div style={{ width: "100%" }}>
	  <button
        style={backBtn}
        onClick={() => router.push(`/notes/${folderId}`)}
      >
        ← Back to Folder
      </button>
	  </div>

      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        {fileData?.title}
      </h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <button style={zoomBtn} onClick={() => handleZoom(0.1)}>Zoom +</button>
        <button style={zoomBtn} onClick={() => handleZoom(-0.1)}>Zoom -</button>
      </div>

      <CanvasViewer imageUrls={imageUrls} zoom={zoom} userId={user.uid} />
    </div>
	  </div>
  );
}

/* ---------------- STYLES ---------------- */
const backBtn = {
  border: "none",
  background: "none",
  color: "#16a34a",
  cursor: "pointer",
  marginBottom: 16,
  fontSize: 16,
};

const zoomBtn = {
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  margin: "0 8px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

