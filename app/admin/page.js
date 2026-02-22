"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
	updateDoc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("folders");

  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolder, setNewFolder] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
  });
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [uploadStatus, setUploadStatus] = useState([]);

  // ✅ NEW: track which purchase is processing
  const [actionLoadingId, setActionLoadingId] = useState(null);

const [authorized, setAuthorized] = useState(false);

  // ---------------- AUTH ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
    try{
      const adminSnap = await getDocs(collection(db, "admins"));
     const isAdminUser = adminSnap.docs.some((d) => d.id === u.uid);

	     if (!isAdminUser) {
        alert("Access denied");
setAuthorized(false);
        setLoading(false);
        router.push("/notes");
        return;
      }
	    setAuthorized(true);
      await fetchFolders();
      await fetchPendingPurchases();
      
	    } catch (err) {
      console.error("Auth check failed", err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  });
    return () => unsub();
  }, [router]);

  // ---------------- FETCH ----------------
  const fetchFolders = async () => {
    const snap = await getDocs(collection(db, "folders"));
    setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchPendingPurchases = async () => {
    const snap = await getDocs(collection(db, "pendingPurchases"));
    setPendingPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.status !== "approved")
    );
  };

  // ---------------- CREATE FOLDER ----------------
  const createFolder = async () => {
    if (!newFolder.id || !newFolder.title || !newFolder.price) {
      alert("Folder ID, Title and Price are required");
      return;
    }
    await setDoc(doc(db, "folders", newFolder.id), {
      ...newFolder,
      price: Number(newFolder.price),
      purchasedBy: [],
      createdAt: serverTimestamp(),
      isActive: true,
    });
    alert("Folder created ✅");
    setNewFolder({ id: "", title: "", description: "", price: "" });
    fetchFolders();
  };

  // ---------------- UPLOAD PDF ----------------
  const uploadFiles = async () => {
    if (!selectedFolder || pdfFiles.length === 0) {
      alert("Select folder and PDFs");
      return;
    }

    const statusArr = [];

    for (const file of pdfFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", selectedFolder);

        const res = await fetch("/api/upload-pdf-images", {
          method: "POST",
          body: formData,
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(text);
        }

        const { uploadedFiles, error } = await res.json();
        if (error) throw new Error(error);

        for (const uploadedFile of uploadedFiles) {
          await addDoc(collection(db, "folderFiles"), {
            folderId: selectedFolder,
            title: uploadedFile.title,
            imageUrls: uploadedFile.imageObjects,
            createdAt: serverTimestamp(),
          });
        }

        statusArr.push({ file: file.name, success: true });
      } catch (err) {
        console.error(err);
        statusArr.push({
          file: file.name,
          success: false,
          error: err.message,
        });
      }
    }

    setUploadStatus(statusArr);
    setPdfFiles([]);
    alert("Upload completed! Check status below ⬇️");
  };

  // ---------------- PURCHASES ----------------
  const approvePurchase = async (p) => {
    if (actionLoadingId) return;

      setActionLoadingId(p.id);

	    const approvedRef = doc(db, "approvedPurchases", `${p.userId}_${p.folderId}`);
  const folderRef = doc(db, "folders", p.folderId);
  const pendingRef = doc(db, "pendingPurchases", `${p.userId}_${p.folderId}`);

  try {
    // 1️⃣ Add approved purchase record
    await setDoc(approvedRef, {
      userId: p.userId,
      folderId: p.folderId,
      refId: p.refId,
      price: p.price,
      status: "approved",
      approvedAt: serverTimestamp(),
    });

    // 2️⃣ Update folder's purchasedBy
    await updateDoc(folderRef, {
      purchasedBy: arrayUnion(p.userId),
    });

    // 3️⃣ Delete pending purchase
    await deleteDoc(pendingRef);

    // 4️⃣ Refresh data
    fetchPendingPurchases();
    fetchFolders();

    alert("Purchase approved ✅");
  } catch (err) {
    console.error("Approval failed:", err);

    // Optional rollback logic: if first step succeeded but second failed, you can delete approvedRef manually
    try {
      if (err.message.includes("update")) {
        await deleteDoc(approvedRef);
      }
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }

    alert("Approval failed ❌");
  } finally {
    setActionLoadingId(null);
  }
};


  const denyPurchase = async (p) => {
    if (actionLoadingId) return;

    try {
      setActionLoadingId(p.id);
      await deleteDoc(doc(db, "pendingPurchases", `${p.userId}_${p.folderId}`));
      fetchPendingPurchases();
    } catch (err) {
      console.error(err);
      alert("Deny failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
if (!authorized) return <p style={{ padding: 24, color: "red" }}>Not Authorized ❌</p>;
  return (
    <div style={container}>
<Navbar />
      
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Admin Dashboard
      </h1>

      <div style={tabs}>
        <Tab
          label="Folders"
          active={activeTab === "folders"}
          onClick={() => setActiveTab("folders")}
        />
        <Tab
          label="Upload PDFs"
          active={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
        />
        <Tab
          label="Purchases"
          active={activeTab === "purchases"}
          onClick={() => setActiveTab("purchases")}
        />
      </div>

      {/* ----------- FOLDERS ----------- */}
      {activeTab === "folders" && (
        <Section title="Create Folder">
          <input
            placeholder="Folder ID"
            value={newFolder.id}
            onChange={(e) =>
              setNewFolder({ ...newFolder, id: e.target.value })
            }
            style={input}
          />
          <input
            placeholder="Title"
            value={newFolder.title}
            onChange={(e) =>
              setNewFolder({ ...newFolder, title: e.target.value })
            }
            style={input}
          />
          <input
            placeholder="Description"
            value={newFolder.description}
            onChange={(e) =>
              setNewFolder({
                ...newFolder,
                description: e.target.value,
              })
            }
            style={input}
          />
          <input
            placeholder="Price"
            type="number"
            value={newFolder.price}
            onChange={(e) =>
              setNewFolder({ ...newFolder, price: e.target.value })
            }
            style={input}
          />
          <button onClick={createFolder} style={btnPrimary}>
            Create Folder
          </button>
        </Section>
      )}

      {/* ----------- UPLOAD ----------- */}
      {activeTab === "upload" && (
        <Section title="Upload & Convert PDFs">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            style={input}
          >
            <option value="">-- Select Folder --</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) =>
              setPdfFiles(Array.from(e.target.files))
            }
            style={input}
          />
          <button onClick={uploadFiles} style={btnPrimary}>
            Upload & Convert
          </button>

          {uploadStatus.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Upload Status:</h3>
              <ul>
                {uploadStatus.map((s, i) => (
                  <li
                    key={i}
                    style={{ color: s.success ? "green" : "red" }}
                  >
                    {s.file}:{" "}
                    {s.success
                      ? "✅ Uploaded & Converted"
                      : `❌ Failed (${s.error})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* ----------- PURCHASES ----------- */}
      {activeTab === "purchases" && (
        <Section title="Pending Purchases">
          {pendingPurchases.length === 0 ? (
            <p>No pending approvals 🎉</p>
          ) : (
            pendingPurchases.map((p) => (
              <div key={p.id} style={card}>
                <div>
                  <p><b>User ID:</b> {p.userId}</p>
    <p><b>Folder:</b> {folders.find(f => f.id === p.folderId)?.title || p.folderId}</p>
    <p><b>Amount:</b> ₹{p.price}</p>
    <p><b>Reference ID:</b> {p.refId}</p>
    <p><b>Status:</b> {p.status}</p>
    <p><b>Created At:</b> {p.createdAt?.toDate?.().toLocaleString() || "-"}</p>


                </div>
                <div>
                  <button
                    onClick={() => approvePurchase(p)}
                    disabled={actionLoadingId === p.id}
                    style={{
                      ...btnApprove,
                      opacity:
                        actionLoadingId === p.id ? 0.6 : 1,
                    }}
                  >
                    {actionLoadingId === p.id
                      ? "Processing…"
                      : "Approve"}
                  </button>
                  <button
                    onClick={() => denyPurchase(p)}
                    disabled={actionLoadingId === p.id}
                    style={{
                      ...btnDeny,
                      opacity:
                        actionLoadingId === p.id ? 0.6 : 1,
                    }}
                  >
                    {actionLoadingId === p.id
                      ? "Processing…"
                      : "Deny"}
                  </button>
                </div>
              </div>
            ))
          )}
        </Section>
      )}
    </div>
  );
}

// ---------------- UI HELPERS ----------------
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 18px",
      borderRadius: 8,
      border: "1px solid #ccc",
      background: active ? "#0ea5e9" : "#fff",
      color: active ? "#fff" : "#000",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    {label}
  </button>
);

const Section = ({ title, children }) => (
  <div style={{ marginTop: 24 }}>
    <h2 style={{ marginBottom: 16 }}>{title}</h2>
    {children}
  </div>
);

const container = { maxWidth: 1200, margin: "0 auto", padding: 24 };
const tabs = { display: "flex", gap: 12, justifyContent: "center" };
const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const btnPrimary = {
  background: "#0ea5e9",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};
const btnApprove = {
  background: "green",
  color: "#fff",
  padding: "6px 12px",
  marginRight: 8,
  borderRadius: 6,
  border: "none",
};
const btnDeny = {
  background: "crimson",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
};
const card = {
  display: "flex",
  justifyContent: "space-between",
  padding: 14,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  marginBottom: 12,
};

