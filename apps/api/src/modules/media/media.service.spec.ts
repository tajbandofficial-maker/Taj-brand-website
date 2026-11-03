import { buildMediaKey, slugifyFilename } from "./media.service.js";

describe("media keys", () => {
  it("slugifies filenames", () => {
    expect(slugifyFilename("Baraat Night (1).JPG")).toBe("baraat-night-1");
    expect(slugifyFilename("..png")).toBe("image");
  });

  it("builds content-hashed keys under uploads/yyyy/mm", () => {
    const key = buildMediaKey(
      { filename: "Dhol Players.jpeg", mimeType: "image/jpeg", sha256: "ab12cd34".padEnd(64, "0") },
      new Date("2026-03-05T10:00:00Z"),
    );
    expect(key).toBe("uploads/2026/03/ab12cd34-dhol-players.jpg");
  });

  it("falls back to a random 8-hex prefix without a hash", () => {
    expect(buildMediaKey({ filename: "x.webp", mimeType: "image/webp" })).toMatch(
      /^uploads\/\d{4}\/\d{2}\/[a-f0-9]{8}-x\.webp$/,
    );
  });
});
