import https from "https";

const SAP_HOST = "10.20.6.144";
const SAP_PORT = 44300;
const SAP_PATH = "/sap/bc/zfi/ds_bp_api?sap-client=500";
const AUTH = Buffer.from("DASHBOARD:Integration2026").toString("base64");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, month, year } = req.body || {};
  const requestBody = JSON.stringify({
    date: date ?? "",
    month: month ?? "",
    year: year ?? "",
  });

  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: SAP_HOST,
        port: SAP_PORT,
        path: SAP_PATH,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${AUTH}`,
          "Content-Length": Buffer.byteLength(requestBody),
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
              new Error(`SAP вернул ${response.statusCode}: ${body.slice(0, 200)}`)
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
      request.write(requestBody);
      request.end();
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("fi_bp proxy error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка запроса" });
  }
}
