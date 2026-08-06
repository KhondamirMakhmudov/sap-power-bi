import { parseFiBpExcel } from "@/utils/parseFiBpExcel";

const FILE_NAME = "Д-т К-т 01.08.2026.xlsx";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = parseFiBpExcel(FILE_NAME);
    return res.status(200).json(data);
  } catch (error) {
    console.error("fi_bp_excel parse error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка чтения файла" });
  }
}
