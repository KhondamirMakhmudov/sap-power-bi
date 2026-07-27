import https from "https";

// Aggregated logistics analytics — per-currency counts/sums across inbound
// deliveries, contracts, purchase orders, purchase requisitions and invoices.
// Same SAP host/client as general_block.js; a different service group
// (ZSC_TOTALS_O4), so it needs its own authorization grant even once
// ZSC_GENERAL_BLOCK_O4 is sorted.
const SAP_HOST = "10.20.6.146";
const SAP_PORT = 44300;
const SAP_PATH =
  "/sap/opu/odata4/sap/zsc_totals_o4/srvd_a2x/sap/zsc_c_totals_api/0001/Totals";
const AUTH = Buffer.from("DASHBOARD:Integration2026").toString("base64");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const params = new URLSearchParams({
    "sap-client": "700",
    "sap-language": "RU",
    $format: "json",
  });
  const path = `${SAP_PATH}?${params.toString()}`;

  // Visible in DevTools → Network → this request → Response Headers, so the
  // real upstream call is inspectable without exposing it as the browser's
  // own request (which would leak the Basic Auth credentials client-side).
  res.setHeader("X-Upstream-Url", `https://${SAP_HOST}:${SAP_PORT}${path}`);

  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: SAP_HOST,
        port: SAP_PORT,
        path,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${AUTH}`,
        },
        rejectUnauthorized: false,
      };

      const request = https.request(options, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode >= 400) {
            reject(
              new Error(
                `SAP вернул ${response.statusCode}: ${body.slice(0, 300)}`,
              ),
            );
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error("Некорректный JSON от SAP"));
          }
        });
      });

      request.on("error", reject);
      request.end();
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("logistics_totals proxy error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка запроса" });
  }
}
