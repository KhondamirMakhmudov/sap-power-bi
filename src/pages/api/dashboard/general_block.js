import https from "https";

// New consolidated logistics endpoint — SAP now joins PR + Contract + PO + GR +
// Invoice server-side into one flat entity, replacing the 5 separate calls in
// logistics_bp.js. Different host/client than the old logistics APIs.
const SAP_HOST = "10.20.6.144";
const SAP_PORT = 44300;
const SAP_PATH =
  "/sap/opu/odata4/sap/zsc_general_block_o4/srvd_a2x/sap/zsc_general_block_api/0001/GeneralBlock";
const AUTH = Buffer.from("DASHBOARD:Integration2026").toString("base64");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query = {} } = req.body || {};

  const params = new URLSearchParams({
    "sap-client": "500",
    "sap-language": "RU",
    $format: "json",
    ...query,
  });
  const path = `${SAP_PATH}?${params.toString()}`;

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
    console.error("general_block proxy error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка запроса" });
  }
}
