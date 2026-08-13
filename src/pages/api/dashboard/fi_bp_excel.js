import { parseFiBpExcel, findLatestFiBpExcelFile } from "@/utils/parseFiBpExcel";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const fileName = findLatestFiBpExcelFile();
    if (!fileName) {
      return res.status(404).json({ error: "Файл Д-т К-т *.xlsx не найден в public/files" });
    }
    const data = parseFiBpExcel(fileName);
    return res.status(200).json(data);
  } catch (error) {
    console.error("fi_bp_excel parse error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка чтения файла" });
  }
}
