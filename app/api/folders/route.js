import {  ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({ region: "ap-south-1" }); // your region


export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: "AyurVidyaNotes",
      Delimiter: "/", 
    });

    const response = await s3.send(command);
    const folders = response.CommonPrefixes?.map(p => p.Prefix.replace("/", "")) || [];
    
    return NextResponse.json({ folders });
  } catch (err) {
    return NextResponse.json({ folders: [] }); // Return empty array on error to prevent crash
  }
}
