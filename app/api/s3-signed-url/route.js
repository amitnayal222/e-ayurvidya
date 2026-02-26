// /app/api/s3-signed-url/route.js
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Key is required" }), { status: 400 });
  }

  try {
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 300, // 5 minutes
    });
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

