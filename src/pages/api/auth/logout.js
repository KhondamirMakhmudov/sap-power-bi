export default function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    "session_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0",
  );
  return res.status(200).json({ ok: true });
}
