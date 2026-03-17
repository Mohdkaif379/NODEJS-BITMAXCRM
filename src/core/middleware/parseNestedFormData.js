function tokenize(key) {
  // Supports: a[b][0][c] => ["a","b","0","c"]
  const tokens = String(key).match(/([^[\]]+)/g);
  return tokens || [String(key)];
}

function isIndexToken(t) {
  return /^[0-9]+$/.test(String(t));
}

function assignPath(obj, tokens, value) {
  let cur = obj;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const last = i === tokens.length - 1;
    const nextToken = tokens[i + 1];

    if (last) {
      if (Array.isArray(cur) && isIndexToken(token)) cur[Number(token)] = value;
      else cur[token] = value;
      return;
    }

    const shouldBeArray = isIndexToken(nextToken);
    if (Array.isArray(cur)) {
      const idx = isIndexToken(token) ? Number(token) : null;
      if (idx === null) return; // unsupported
      if (cur[idx] === undefined) cur[idx] = shouldBeArray ? [] : {};
      cur = cur[idx];
    } else {
      if (cur[token] === undefined) cur[token] = shouldBeArray ? [] : {};
      cur = cur[token];
    }
  }
}

function parseNestedFormData(req, _res, next) {
  const contentType = String(req.headers?.["content-type"] || "");
  if (!contentType.includes("multipart/form-data")) return next();

  const raw = req.body || {};
  const out = {};

  for (const key of Object.keys(raw)) {
    const val = raw[key];
    const tokens = tokenize(key);
    if (tokens.length === 1) {
      out[key] = val;
      continue;
    }
    assignPath(out, tokens, val);
  }

  req.body = out;
  next();
}

module.exports = parseNestedFormData;

