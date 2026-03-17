const cloudinary = require("cloudinary").v2;

const CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const API_KEY = (process.env.CLOUDINARY_API_KEY || "").trim();
const API_SECRET = (process.env.CLOUDINARY_API_SECRET || "").trim();

// Cloudinary cloud_name is not the "API Key Name". It is the account's cloud name shown in the dashboard.
cloudinary.config({
  cloud_name: CLOUD_NAME.toLowerCase(),
  api_key: API_KEY,
  api_secret: API_SECRET
});

function isProbablyUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isDataUri(value) {
  return typeof value === "string" && value.startsWith("data:");
}

async function uploadImage(imageInput, options = {}) {
  if (!imageInput) return null;
  if (isProbablyUrl(imageInput)) return imageInput; // already a URL

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    const missing = [];
    if (!CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!API_KEY) missing.push("CLOUDINARY_API_KEY");
    if (!API_SECRET) missing.push("CLOUDINARY_API_SECRET");
    throw new Error(`Cloudinary env missing: ${missing.join(", ")}`);
  }

  // Accept a data URI (recommended) or any Cloudinary-supported upload input.
  // For raw base64, client should send: data:image/png;base64,<...>
  const uploadable = isDataUri(imageInput) ? imageInput : String(imageInput);

  let res;
  try {
    res = await cloudinary.uploader.upload(uploadable, {
      resource_type: "image",
      ...options
    });
  } catch (err) {
    // Surface a clearer hint for the most common setup issue
    if (String(err?.message || "").toLowerCase().includes("invalid cloud_name")) {
      throw new Error(
        `Invalid Cloudinary cloud name "${CLOUD_NAME}". Set CLOUDINARY_CLOUD_NAME to the Cloud name shown in Cloudinary Dashboard (not the API Key Name).`
      );
    }
    throw err;
  }

  return res.secure_url || res.url;
}

module.exports = { cloudinary, uploadImage };
