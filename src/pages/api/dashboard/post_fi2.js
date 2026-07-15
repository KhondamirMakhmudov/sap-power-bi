export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date_from, date_to, be } = req.body;

    if (!date_from || !date_to) {
      return res
        .status(400)
        .json({ error: "date_from and date_to are required" });
    }

    const payload = { date_from, date_to };
    if (be) payload.be = be;

    const response = await fetch("http://10.20.7.6/tes/hs/dashboard/post_fi2", {
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
    console.error("Dashboard post_fi2 API proxy error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to fetch dashboard data",
    });
  }
}
