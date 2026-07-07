import https from "https";

const SAP_URL =
  "https://10.20.6.150:44300/sap/bc/zbdt_dashboard?sap-client=200";
const SAP_AUTH = Buffer.from("DASHBOARD:Integration2026").toString("base64");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { calyear, version, comp, month_from, month_to } = req.body || {};

  if (!calyear || !version) {
    return res.status(400).json({ error: "calyear and version are required" });
  }

  const payload = { calyear, version };
  if (Array.isArray(comp) && comp.length > 0) payload.comp = comp;
  if (month_from) payload.month_from = month_from;
  if (month_to) payload.month_to = month_to;

  const body = JSON.stringify(payload);
  const url = new URL(SAP_URL);

  return new Promise((resolve) => {
    const request = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${SAP_AUTH}`,
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
      },
      (sapRes) => {
        let raw = "";
        sapRes.on("data", (chunk) => {
          raw += chunk;
        });
        sapRes.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            resolve(res.status(sapRes.statusCode).json(parsed));
          } catch {
            resolve(
              res.status(502).json({
                error: `SAP вернул не-JSON ответ (HTTP ${sapRes.statusCode})`,
                sap_status: sapRes.statusCode,
                sap_body: raw.slice(0, 300),
              }),
            );
          }
        });
      },
    );

    request.on("error", (err) => {
      console.error("SAP budget dashboard proxy error:", err);
      resolve(res.status(502).json({ error: err.message }));
    });

    request.write(body);
    request.end();
  });
}
