import fs from "fs";
import path from "path";
import { isAuthenticated } from "@/utils/auth";
import { findLatestFiBpExcelFile } from "@/utils/parseFiBpExcel";

const FILES_DIR = path.join(process.cwd(), "public", "files");
const FI_BP_FILE_RE = /^Д-т К-т \d{2}\.\d{2}\.\d{4}\.xlsx$/i;

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let entries = [];
  try {
    entries = fs.readdirSync(FILES_DIR).filter((name) => FI_BP_FILE_RE.test(name));
  } catch {
    entries = [];
  }

  const active = findLatestFiBpExcelFile();

  return res.status(200).json({
    active,
    files: entries.sort().reverse(),
  });
}
