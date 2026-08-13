import fs from "fs";
import path from "path";
import { formidable } from "formidable";
import { isAuthenticated } from "@/utils/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const FILES_DIR = path.join(process.cwd(), "public", "files");
const FI_BP_FILE_RE = /^Д-т К-т \d{2}\.\d{2}\.\d{4}\.xlsx$/i;

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false, keepExtensions: true });
    const [, files] = await form.parse(req);

    const uploaded = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploaded) {
      return res.status(400).json({ error: "Файл не найден в запросе" });
    }

    const originalName = uploaded.originalFilename || "";
    if (!FI_BP_FILE_RE.test(originalName)) {
      fs.unlink(uploaded.filepath, () => {});
      return res.status(400).json({
        error: `Имя файла должно быть в формате "Д-т К-т ДД.ММ.ГГГГ.xlsx", получено: "${originalName}"`,
      });
    }

    fs.mkdirSync(FILES_DIR, { recursive: true });
    const destPath = path.join(FILES_DIR, originalName);
    fs.copyFileSync(uploaded.filepath, destPath);
    fs.unlink(uploaded.filepath, () => {});

    return res.status(200).json({ ok: true, fileName: originalName });
  } catch (error) {
    console.error("upload-fi-excel error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка загрузки файла" });
  }
}
