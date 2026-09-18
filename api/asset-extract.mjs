import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ZIP_NAME = "AVGL_FULL_ASSET_PACKAGE_LAYERED_PROJECTION.zip";
const ZIP_PATH = path.join(process.cwd(), ZIP_NAME);
const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

function parseEntries(buf) {
  const min = Math.max(0, buf.length - 0xffff - 22);
  let eocd = -1;
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("EOCD not found");

  const total = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const entries = [];
  let p = cdOffset;

  for (let i = 0; i < total; i++) {
    if (buf.readUInt32LE(p) !== CEN_SIG) throw new Error("Invalid central directory");
    const method = buf.readUInt16LE(p + 10);
    const crc32 = buf.readUInt32LE(p + 16);
    const compressedSize = buf.readUInt32LE(p + 20);
    const uncompressedSize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    entries.push({ name, method, crc32, compressedSize, uncompressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function contentTypeFor(name) {
  const ext = path.extname(name).toLowerCase();
  return ({
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8"
  })[ext] || "application/octet-stream";
}

function extractEntry(buf, entry) {
  const p = entry.localOffset;
  if (buf.readUInt32LE(p) !== LOC_SIG) throw new Error("Invalid local header");
  const nameLen = buf.readUInt16LE(p + 26);
  const extraLen = buf.readUInt16LE(p + 28);
  const start = p + 30 + nameLen + extraLen;
  const compressed = buf.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return Buffer.from(compressed);
  if (entry.method === 8) return zlib.inflateRawSync(compressed);
  throw new Error(`Unsupported compression method ${entry.method}`);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });
    const zip = fs.readFileSync(ZIP_PATH);
    const entries = parseEntries(zip).filter((e) => !e.name.endsWith("/"));

    if (req.query?.list === "1") {
      return res.status(200).json({
        zip: ZIP_NAME,
        count: entries.length,
        files: entries.map(({ name, compressedSize, uncompressedSize, crc32, method }) => ({
          name, compressedSize, uncompressedSize, crc32, method
        }))
      });
    }

    if (typeof req.query?.start === "string") {
      const start = Math.max(0, Number.parseInt(req.query.start, 10) || 0);
      const count = Math.min(8, Math.max(1, Number.parseInt(String(req.query.count || "8"), 10) || 8));
      const selected = entries.slice(start, start + count);
      return res.status(200).json({
        start,
        count: selected.length,
        total: entries.length,
        files: selected.map((entry) => {
          const out = extractEntry(zip, entry);
          return { path: entry.name, size: out.length, contentBase64: out.toString("base64") };
        })
      });
    }

    const requested = typeof req.query?.path === "string" ? req.query.path : "";
    if (!requested) return res.status(400).json({ error: "path_required" });
    if (requested.includes("..") || requested.startsWith("/")) {
      return res.status(400).json({ error: "invalid_path" });
    }

    const entry = entries.find((e) => e.name === requested);
    if (!entry) return res.status(404).json({ error: "not_found" });
    const out = extractEntry(zip, entry);

    if (req.query?.raw === "1") {
      res.setHeader("Content-Type", contentTypeFor(entry.name));
      res.setHeader("Content-Length", String(out.length));
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.status(200).send(out);
    }

    return res.status(200).json({
      path: entry.name,
      size: out.length,
      contentBase64: out.toString("base64")
    });
  } catch (error) {
    return res.status(500).json({ error: "extract_failed", detail: error?.message || String(error) });
  }
}
