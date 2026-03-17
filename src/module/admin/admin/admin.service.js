const bcrypt = require("bcrypt");
const Admin = require("./admin.model");
const { uploadImage } = require("../../../core/config/cloudinary");
const { signJwtHs256 } = require("../../../core/utils/jwt");

function pickAdminCreateFields(body) {
  return {
    full_name: body?.full_name,
    email: body?.email,
    password: body?.password,
    number: body?.number ?? null,
    profile_photo: body?.profile_photo ?? null,
    status: body?.status ?? 1,
    bio: body?.bio ?? null,
    company_logo: body?.company_logo ?? null,
    company_name: body?.company_name ?? null
    // role/permissions intentionally not accepted from body
  };
}

function pickAdminUpdateFields(body) {
  const update = {};
  const allowed = [
    "full_name",
    "email",
    "password",
    "number",
    "profile_photo",
    "status",
    "bio",
    "company_logo",
    "company_name"
  ];

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }

  delete update.role;
  delete update.permissions;

  return update;
}

async function createAdmin(body) {
  const data = pickAdminCreateFields(body);

  if (!data.full_name) throw Object.assign(new Error("full_name is required"), { statusCode: 400 });
  if (!data.email) throw Object.assign(new Error("email is required"), { statusCode: 400 });
  if (!data.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(String(data.password), 10);

  const profilePhotoUrl = data.profile_photo
    ? await uploadImage(data.profile_photo, { folder: "bitmax/admins/profile" })
    : null;

  const companyLogoUrl = data.company_logo
    ? await uploadImage(data.company_logo, { folder: "bitmax/admins/company_logo" })
    : null;

  const admin = await Admin.create({
    ...data,
    password: passwordHash,
    profile_photo: profilePhotoUrl,
    company_logo: companyLogoUrl,
    role: "admin",
    permissions: ["*"]
  });

  return admin;
}

async function listAdmins() {
  return Admin.find({}).sort({ created_at: -1 });
}

async function getAdminById(id) {
  const admin = await Admin.findById(id);
  if (!admin) throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
  return admin;
}

async function updateAdmin(id, body) {
  const update = pickAdminUpdateFields(body);

  if ("password" in update) {
    if (!update.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });
    update.password = await bcrypt.hash(String(update.password), 10);
  }

  if ("profile_photo" in update) {
    update.profile_photo = update.profile_photo
      ? await uploadImage(update.profile_photo, { folder: "bitmax/admins/profile" })
      : null;
  }

  if ("company_logo" in update) {
    update.company_logo = update.company_logo
      ? await uploadImage(update.company_logo, { folder: "bitmax/admins/company_logo" })
      : null;
  }

  const admin = await Admin.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
  if (!admin) throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
  return admin;
}

async function deleteAdmin(id) {
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) throw Object.assign(new Error("Admin not found"), { statusCode: 404 });
  return admin;
}

async function loginAdmin(email, password) {
  if (!email || !password) throw Object.assign(new Error("email and password are required"), { statusCode: 400 });

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
  if (!admin) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const ok = await bcrypt.compare(String(password), admin.password);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error("JWT_SECRET is not set in environment"), { statusCode: 500 });

  // No exp => token never expires
  const token = signJwtHs256(
    {
      sub: String(admin._id),
      role: admin.role,
      permissions: admin.permissions
    },
    secret
  );

  return { admin, token };
}

module.exports = {
  createAdmin,
  listAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin
};
