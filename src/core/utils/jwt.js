const crypto = require("crypto");

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecodeToBuffer(input) {
  const str = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str + pad, "base64");
}

function signJwtHs256(payload, secret, options = {}) {
  if (!secret) throw new Error("JWT secret is required");
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, ...payload };

  // If you want expiry later, pass options.expiresInSeconds
  if (options.expiresInSeconds) body.exp = now + Number(options.expiresInSeconds);

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", String(secret)).update(data).digest();
  return `${data}.${base64UrlEncode(signature)}`;
}

function verifyJwtHs256(token, secret) {
  if (!secret) throw new Error("JWT secret is required");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const data = `${parts[0]}.${parts[1]}`;
  const sig = base64UrlDecodeToBuffer(parts[2]);
  const expected = crypto.createHmac("sha256", String(secret)).update(data).digest();
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) {
    throw new Error("Invalid token");
  }

  const payloadJson = base64UrlDecodeToBuffer(parts[1]).toString("utf8");
  const payload = JSON.parse(payloadJson);

  // Expiry is optional; if missing, token never expires.
  if (payload && payload.exp && Math.floor(Date.now() / 1000) >= Number(payload.exp)) {
    throw new Error("Token expired");
  }

  return payload;
}

module.exports = { signJwtHs256, verifyJwtHs256 };

