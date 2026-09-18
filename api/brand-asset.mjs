import fs from "node:fs";
import path from "node:path";
import { parseEntries, extractEntry } from "./asset-extract.mjs";

const ZIP_PATH = path.join(process.cwd(), "AVGL_FULL_ASSET_PACKAGE_LAYERED_PROJECTION.zip");
const PREFIX = "AVGL_FULL_ASSET_PACKAGE/";
const MIME = {
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".ico":"image/x-icon",
  ".pdf":"application/pdf",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".md":"text/markdown; charset=utf-8",
  ".txt":"text/plain; charset=utf-8",
  ".webmanifest":"application/manifest+json"
};

export default async function handler(req,res){
  try{
    if(req.method!=="GET") return res.status(405).end();
    const rel=typeof req.query?.path==="string"?req.query.path:"";
    if(!rel||rel.includes("..")||rel.startsWith("/")) return res.status(400).json({error:"invalid_path"});
    const zip=fs.readFileSync(ZIP_PATH);
    const entry=parseEntries(zip).find((e)=>e.name===PREFIX+rel);
    if(!entry) return res.status(404).json({error:"not_found"});
    const data=extractEntry(zip,entry);
    const ext=path.extname(rel).toLowerCase();
    res.setHeader("Content-Type",MIME[ext]||"application/octet-stream");
    res.setHeader("Cache-Control","public, max-age=86400, s-maxage=604800, immutable");
    res.setHeader("Content-Disposition",`inline; filename="${path.basename(rel).replaceAll('"','')}"`);
    return res.status(200).send(data);
  }catch(error){
    return res.status(500).json({error:"asset_failed",detail:error?.message||String(error)});
  }
}
