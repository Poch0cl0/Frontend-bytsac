const BACKEND =
  process.env.BACKEND_URL ||
  "http://m0w8c4kc4ggg8cws4wccc04w.46.224.176.169.sslip.io";

module.exports = async function handler(req, res) {
  const parts = req.query.path;
  const suffix = Array.isArray(parts) ? parts.join("/") : parts || "";
  const queryIndex = req.url.indexOf("?");
  const qs = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
  const target = `${BACKEND.replace(/\/$/, "")}/api/${suffix}${qs}`;

  const headers = {
    Accept: req.headers.accept || "application/json",
    "Content-Type": req.headers["content-type"] || "application/json",
  };

  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (typeof req.body === "string") {
      init.body = req.body;
    } else if (req.body && Object.keys(req.body).length > 0) {
      init.body = JSON.stringify(req.body);
    }
  }

  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type");

    res.status(upstream.status);
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.send(text);
  } catch (error) {
    res.status(502).json({
      message: "No se pudo conectar al backend",
      target,
      error: String(error && error.message ? error.message : error),
    });
  }
};
