import { parseOperDtkt } from "@/utils/parseOperDtkt";

const ENDPOINT = "http://10.20.7.6/tes/hs/dashboard/operdtkt";
const AUTH = "Basic YnBtczoyMjExMjAyMw=="; // bpms:22112023 — same creds as post_fi / post_fi2

function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const dateTo = req.body?.date_to || todayIso();

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH,
      },
      body: JSON.stringify({ date_to: dateTo }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Внешний сервис вернул ${response.status}: ${text.slice(0, 200)}`);
    }

    const json = await response.json();
    if (json?.success !== "true" && json?.success !== true) {
      throw new Error(json?.msg || "Сервис вернул ошибку");
    }

    return res.status(200).json(parseOperDtkt(json, dateTo));
  } catch (error) {
    console.error("new_fi_bp proxy error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка запроса" });
  }
}
