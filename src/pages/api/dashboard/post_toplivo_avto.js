/**
 * API proxy route for vehicle fuel consumption data — same SAP host/creds as
 * post_fi / post_fi2. `be` must be a non-empty list of company codes or SAP
 * returns an empty result set, so this defaults to every known company code
 * when the caller doesn't supply one.
 */

const ALL_COMPANY_CODES = [
  "1010", "1020", "1030", "1040", "1050", "1060", "1070",
  "1080", "1090", "1100", "1110", "1120", "1130", "1140", "1150",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date_from, date_to, be } = req.body || {};

    if (!date_from || !date_to) {
      return res
        .status(400)
        .json({ error: "date_from and date_to are required" });
    }

    const payload = {
      date_from,
      date_to,
      be: Array.isArray(be) && be.length > 0 ? be : ALL_COMPANY_CODES,
    };

    const response = await fetch("http://10.20.7.6/tes/hs/dashboard/post_toplivo_avto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic YnBtczoyMjExMjAyMw==",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `External API responded with status ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("post_toplivo_avto proxy error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to fetch fuel data",
    });
  }
}
