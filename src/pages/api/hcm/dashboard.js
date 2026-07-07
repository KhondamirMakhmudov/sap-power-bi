import https from "https";

const SAP_URL = "https://10.20.6.144:44300/sap/bc/hcm/dashboard?sap-client=500";
const SAP_AUTH = Buffer.from("Dashboard:Integration2026").toString("base64");
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Module-scope: survives across requests for the life of the Node process,
// reset on server restart/redeploy.
const cache = new Map(); // key -> { data, timestamp }
const inFlight = new Map(); // key -> Promise<data>, dedupes concurrent identical requests

function fetchFromSap(orgin, begda, endda) {
  const body = JSON.stringify({ orgin, begda, endda });
  const url = new URL(SAP_URL);

  return new Promise((resolve, reject) => {
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
            resolve(JSON.parse(raw));
          } catch {
            const err = new Error(`SAP вернул не-JSON ответ (HTTP ${sapRes.statusCode})`);
            err.sap_status = sapRes.statusCode;
            err.sap_body = raw.slice(0, 300);
            reject(err);
          }
        });
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

function getOrFetch(key, orgin, begda, endda) {
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = fetchFromSap(orgin, begda, endda)
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      inFlight.delete(key);
      return data;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

function refreshInBackground(key, orgin, begda, endda) {
  if (inFlight.has(key)) return; // a refresh is already underway
  getOrFetch(key, orgin, begda, endda).catch((err) => {
    console.error("SAP HCM background refresh failed:", err);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orgin = "", begda, endda } = req.body || {};

  if (!begda || !endda) {
    return res.status(400).json({ error: "begda and endda are required" });
  }

  const key = `${orgin}|${begda}|${endda}`;
  const cached = cache.get(key);

  if (cached) {
    if (Date.now() - cached.timestamp >= CACHE_TTL_MS) {
      refreshInBackground(key, orgin, begda, endda);
    }
    return res.status(200).json(cached.data);
  }

  try {
    const data = await getOrFetch(key, orgin, begda, endda);
    return res.status(200).json(data);
  } catch (err) {
    console.error("SAP HCM proxy error:", err);
    return res.status(502).json({
      error: err.message,
      ...(err.sap_status ? { sap_status: err.sap_status, sap_body: err.sap_body } : {}),
    });
  }
}
