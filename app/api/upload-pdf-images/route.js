import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { writeFile, readdir, readFile } from "fs/promises";
import path from "path";
import os from "os";
import util from "util";
import { exec } from "child_process";

const execAsync = util.promisify(exec);
const s3 = new S3Client({ region: "ap-south-1" }); // your bucket region
const BUCKET_NAME = "ayurvidyapdfimg"; // replace with your bucket name

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = form.get("folder");

    if (!file || !folder) {
      return NextResponse.json({ error: "Missing file/folder" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfName = path.parse(file.name).name;

    // ---- TEMP DIR ----
    const workDir = path.join(os.tmpdir(), uuid());
    await execAsync(`mkdir -p "${workDir}"`);

    const pdfPath = path.join(workDir, `${pdfName}.pdf`);
    await writeFile(pdfPath, buffer);

    // ---- PDF → IMAGES ----
    const outputPrefix = path.join(workDir, "page");
    await execAsync(`pdftoppm "${pdfPath}" "${outputPrefix}" -png`);

    // ---- UPLOAD IMAGES TO S3 ----
    const files = await readdir(workDir);
    const images = files.filter((f) => f.startsWith("page-")).sort();
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const imgPath = path.join(workDir, images[i]);
      const imgBuffer = await readFile(imgPath);

      const objectKey = `notes/${folder}/${pdfName}/page-${i + 1}.png`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: objectKey,
          Body: imgBuffer,
          ContentType: "image/png",
        })
      );

      // Store the public URL or S3 key (depending on your get-image API)
      imageUrls.push(objectKey);
    }

    return NextResponse.json({
      uploadedFiles: [
        {
          title: pdfName,
          imageObjects: imageUrls, // match frontend AdminPage.js
        },
      ],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

