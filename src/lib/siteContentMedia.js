import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "site-content");

function safeFilename(name, mimeType = "") {
  let ext = path.extname(name || "").toLowerCase();
  if (ext === ".jp") ext = ".jpg";
  if (!ext || ext.length > 5) {
    if (mimeType.includes("png")) ext = ".png";
    else if (mimeType.includes("webp")) ext = ".webp";
    else if (mimeType.includes("gif")) ext = ".gif";
    else ext = ".jpg";
  }
  const base = path
    .basename(name || "upload", ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const stamp = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString("hex");
  return `${base || "image"}-${stamp}-${rand}${ext}`;
}

export async function saveSiteContentMedia({ buffer, filename, mimeType }) {
  if (!buffer?.length) {
    throw new Error("File buffer is required");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = safeFilename(filename, mimeType);
  const filePath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(filePath, buffer);

  return {
    id: storedName,
    url: `/uploads/site-content/${storedName}`,
    name: filename || storedName,
    mimeType: mimeType || "application/octet-stream",
  };
}

export async function downloadRemoteMedia(url, filename) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to download ${url} (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  return saveSiteContentMedia({ buffer, filename, mimeType });
}
