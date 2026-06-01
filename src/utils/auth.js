const SESSION_COOKIE = "session_token";
const SESSION_VALUE = Buffer.from("bpms:22112023").toString("base64");

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw.split(";").map((c) => {
      const [k, ...rest] = c.trim().split("=");
      return [k, rest.join("=")];
    }),
  );
}

/** Returns true when the request carries a valid session cookie. */
export function isAuthenticated(req) {
  return parseCookies(req)[SESSION_COOKIE] === SESSION_VALUE;
}

/** Returns the username stored in the session, or null if not authenticated. */
export function getSessionUsername(req) {
  if (!isAuthenticated(req)) return null;
  try {
    const decoded = Buffer.from(SESSION_VALUE, "base64").toString("utf-8");
    return decoded.split(":")[0] || null;
  } catch {
    return null;
  }
}
