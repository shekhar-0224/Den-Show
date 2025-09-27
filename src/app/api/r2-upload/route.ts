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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif",
];

// Define allowed image extensions
const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".tif",
  ".avif",
];

const isImageFile = (file: File): boolean => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return false;
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );

  return hasValidExtension;
};

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
  }

  if (!isImageFile(file)) {
    return NextResponse.json(
      {
        error:
          "Only image files are allowed. Supported formats: JPG, PNG, GIF, WebP, SVG, BMP, TIFF",
      },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const fileBuffer = Buffer.from(bytes);

  try {
    const fileKey = uuidv4();

    await s3.send(
      new PutObjectCommand({
        Bucket: "den",
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
        ACL: "public-read",
      }),
    );

    const url = `https://assets.den.show/${fileKey}`;

    return NextResponse.json(
      { message: "Image uploaded successfully", url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};
