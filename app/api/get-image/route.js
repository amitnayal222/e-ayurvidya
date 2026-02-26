export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebaseAdmin"; // initialize admin SDK

const s3 = new S3Client({ region: "ap-south-1" });
const BUCKET = "ayurvidyapdfimg";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const objectKey = searchParams.get("key");
    if (!objectKey) {
      return NextResponse.json({ error: "Missing object" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await getAuth().verifyIdToken(token);

    const folderId = objectKey.split("/")[1]; // notes/{folderId}/...

    const folderSnap = await getFirestore()
      .collection("folders")
      .doc(folderId)
      .get();

    if (!folderSnap.exists) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const purchasedBy = folderSnap.data().purchasedBy || [];
    if (!purchasedBy.includes(decoded.uid)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 120, // 2 minutes
    });

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

