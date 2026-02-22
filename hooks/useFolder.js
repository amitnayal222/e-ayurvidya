// hooks/useFolder.js
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { onSnapshot, doc, getDoc, collection, query, where,orderBy,  getDocs } from "firebase/firestore";

export function useFolder(folderId, uid) {
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId || !uid) return;
const folderRef = doc(db, "folders", folderId);
	  
    const unsubscribe = onSnapshot(folderRef, async (folderDoc) => {
      if (!folderDoc.exists()) {
        setLoading(false);
        return;
      }

      const folderData = folderDoc.data();
      const purchased =
        folderData.purchasedBy?.includes(uid) || false;

      setFolder({
        id: folderDoc.id,
        ...folderData,
        purchased,
      });

      // Load files (only once ideally, but fine here)
      const filesSnap = await getDocs(
        query(
          collection(db, "folderFiles"),
          where("folderId", "==", folderId),
          orderBy("title", "asc")
        )
      );

      setFiles(filesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [folderId, uid]);

  return { folder, files, loading };
}

