import https from "https";

const SAP_HOST = "10.20.6.146";
const SAP_PORT = 44300;
const AUTH = Buffer.from("DASHBOARD:Integration2026").toString("base64");

const ENTITY_PATHS = {
  pr: "/sap/opu/odata4/sap/zsc_api_purreqitem_o4/srvd_a2x/sap/zsc_purreqitem_api/0001/PurReqItemAPI",
  contract:
    "/sap/opu/odata4/sap/zsc_purch_cotract_o4/srvd_a2x/sap/zsc_purch_cotract_api/0001/PurchaseContractAPI",
  po: "/sap/opu/odata4/sap/zsc_api_purrorder_o4/srvd_a2x/sap/zsc_purch_order_api/0001/PurchaseOrderAPI",
  gr: "/sap/opu/odata4/sap/zsc_po_history_o4/srvd_a2x/sap/zsc_po_history_api/0001/PurchaseOrderHistoryAPI",
  invoice:
    "/sap/opu/odata4/sap/zsc_invoice_o4/srvd_a2x/sap/zsc_invoice_api/0001/InvoiceDocument",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { entity, query = {} } = req.body || {};

  if (!entity || !ENTITY_PATHS[entity]) {
    return res.status(400).json({ error: "Invalid or missing entity" });
  }

  const params = new URLSearchParams({
    "sap-client": "700",
    "sap-language": "RU",
    $format: "json",
    ...query,
  });
  const path = `${ENTITY_PATHS[entity]}?${params.toString()}`;

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
    console.error("logistics_bp proxy error:", error);
    return res.status(500).json({ error: error?.message || "Ошибка запроса" });
  }
}
