import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  },
});

export const POST = async (req: NextRequest) => {
  try {
    const { base64Data } = await req.json();

    if (!base64Data) {
      return NextResponse.json(
        { error: "Missing base64Data" },
        { status: 400 },
      );
    }

    if (!base64Data.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 },
      );
    }

    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid base64 format" },
        { status: 400 },
      );
    }

    const [, mimeType, base64String] = matches;
    const contentType = `image/${mimeType}`;

    const buffer = Buffer.from(base64String, "base64");

    const fileKey = `thumbnails/${uuidv4()}.${mimeType === "jpeg" ? "jpg" : mimeType}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: "den",
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      }),
    );

    const url = `https://assets.den.show/${fileKey}`;

    return NextResponse.json(
      { message: "Thumbnail uploaded successfully", url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};
