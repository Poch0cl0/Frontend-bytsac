const BACKEND = (
  process.env.BACKEND_URL ||
  "http://m0w8c4kc4ggg8cws4wccc04w.46.224.176.169.sslip.io"
).replace(/\/$/, "");

module.exports = async function handler(req, res) {
  const rawPath = req.query.path;
  const suffix = Array.isArray(rawPath) ? rawPath.join("/") : rawPath || "";

  const query = { ...req.query };
  delete query.path;
  const qs = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) =>
      Array.isArray(value) ? value.map((v) => [key, v]) : [[key, String(value)]]
    )
  ).toString();

  const target = `${BACKEND}/api/${suffix}${qs ? `?${qs}` : ""}`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const init = { method: req.method, headers };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    init.body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type");
    res.status(upstream.status);
    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("X-Proxy-Target", target);
    res.send(text);
  } catch (error) {
    res.status(502).json({
      message: "No se pudo conectar al backend",
      target,
      error: String(error && error.message ? error.message : error),
    });
  }
};
