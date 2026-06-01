const SESSION_COOKIE = "session_token";
const SESSION_VALUE = Buffer.from("bpms:22112023").toString("base64");

/**
 * Returns true when the request carries a valid session cookie.
 */
export function isAuthenticated(req) {
  const raw = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    raw.split(";").map((c) => {
      const [k, ...rest] = c.trim().split("=");
      return [k, rest.join("=")];
    }),
  );
  return cookies[SESSION_COOKIE] === SESSION_VALUE;
}
