import https from "https";

const SAP_URL = "https://10.20.6.144:44300/sap/bc/hcm/dashboard?sap-client=500";
const SAP_AUTH = Buffer.from("Dashboard:Integration2026").toString("base64");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orgin = "", begda, endda } = req.body || {};

  if (!begda || !endda) {
    return res.status(400).json({ error: "begda and endda are required" });
  }

  const body = JSON.stringify({ orgin, begda, endda });
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
          console.log("SAP HCM status:", sapRes.statusCode);
          console.log("SAP HCM raw (first 500):", raw.slice(0, 500));
          try {
            const parsed = JSON.parse(raw);
            resolve(res.status(200).json(parsed));
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
      console.error("SAP HCM proxy error:", err);
      resolve(res.status(502).json({ error: err.message }));
    });

    request.write(body);
    request.end();
  });
}
