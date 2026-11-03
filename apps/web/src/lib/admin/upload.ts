"use client";

import type { AdminMedia, PresignResponse } from "@taj/types";

import { AdminApiError, bff } from "./api";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_EDGE = 2400; // §6.7: resize to max 2400px long edge before upload
const MAX_BYTES = 15 * 1024 * 1024;

type Prepared = { blob: Blob; type: string; width: number; height: number };

/** Downscales large photos in the browser (canvas) so uploads stay small. */
export async function prepareImage(file: File): Promise<Prepared> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new AdminApiError(400, ["Please choose a JPEG, PNG, WebP or AVIF image."]);
  }
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

  if (scale === 1 && file.size <= MAX_BYTES) {
    bitmap.close();
    return { blob: file, type: file.type, width, height };
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // PNG keeps transparency; everything else becomes high-quality JPEG/WebP.
  const type =
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/jpeg"
        ? "image/jpeg"
        : "image/webp";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image"))),
      type,
      0.88,
    ),
  );
  if (blob.size > MAX_BYTES)
    throw new AdminApiError(400, ["This image is too large even after resizing (max 15 MB)."]);
  return { blob, type, width: w, height: h };
}

async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Upload flow (§6.7): presign via BFF → PUT straight to storage → record the
 * media (with alt text) via BFF. Returns the saved media record.
 */
export async function uploadImage(file: File, alt: string): Promise<AdminMedia> {
  const img = await prepareImage(file);
  const sha256 = await sha256Hex(img.blob);
  const filename = file.name.replace(/\.[^.]+$/, "") + "." + img.type.split("/")[1];

  const presigned = await bff<PresignResponse>("media/presign", {
    method: "POST",
    body: { filename, mimeType: img.type, size: img.blob.size, sha256 },
  });

  const put = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "content-type": img.type },
    body: img.blob,
  });
  if (!put.ok) throw new AdminApiError(put.status, ["Upload to storage failed. Please try again."]);

  return bff<AdminMedia>("media", {
    method: "POST",
    body: { key: presigned.key, mimeType: img.type, width: img.width, height: img.height, alt },
  });
}
