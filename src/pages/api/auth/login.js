const VALID_USERNAME = "bpms";
const VALID_PASSWORD = "22112023";
const SESSION_COOKIE = "session_token";
// Simple signed session value — not cryptographically strong but sufficient
// for an internal tool with known fixed credentials.
const SESSION_VALUE = Buffer.from(
  `${VALID_USERNAME}:${VALID_PASSWORD}`,
).toString("base64");

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      `${SESSION_COOKIE}=${SESSION_VALUE}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 8}`,
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ message: "Неверный логин или пароль" });
}
