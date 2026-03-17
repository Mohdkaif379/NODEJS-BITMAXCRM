const bcrypt = require("bcrypt");
const Admin = require("../admin/admin/admin.model");
const { uploadImage } = require("../../core/config/cloudinary");
const { signJwtHs256 } = require("../../core/utils/jwt");

function pickSubadminCreateFields(body) {
  return {
    full_name: body?.full_name,
    email: body?.email,
    password: body?.password,
    number: body?.number ?? null,
    profile_photo: body?.profile_photo ?? null,
    status: body?.status ?? 1,
    bio: body?.bio ?? null,
    company_logo: body?.company_logo ?? null,
    company_name: body?.company_name ?? null,
    permissions: body?.permissions ?? null
    // role intentionally not accepted from body
  };
}

function pickSubadminUpdateFields(body) {
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
    "company_name",
    "permissions"
  ];

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }

  delete update.role;
  return update;
}

async function createSubadmin(body) {
  const data = pickSubadminCreateFields(body);

  if (!data.full_name) throw Object.assign(new Error("full_name is required"), { statusCode: 400 });
  if (!data.email) throw Object.assign(new Error("email is required"), { statusCode: 400 });
  if (!data.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(String(data.password), 10);

  const profilePhotoUrl = data.profile_photo
    ? await uploadImage(data.profile_photo, { folder: "bitmax/subadmins/profile" })
    : null;

  const companyLogoUrl = data.company_logo
    ? await uploadImage(data.company_logo, { folder: "bitmax/subadmins/company_logo" })
    : null;

  const subadmin = await Admin.create({
    ...data,
    password: passwordHash,
    profile_photo: profilePhotoUrl,
    company_logo: companyLogoUrl,
    role: "subadmin"
  });

  return subadmin;
}

async function listSubadmins() {
  return Admin.find({ role: "subadmin" }).sort({ created_at: -1 });
}

async function getSubadminById(id) {
  const subadmin = await Admin.findOne({ _id: id, role: "subadmin" });
  if (!subadmin) throw Object.assign(new Error("Subadmin not found"), { statusCode: 404 });
  return subadmin;
}

async function updateSubadmin(id, body) {
  const update = pickSubadminUpdateFields(body);

  if ("password" in update) {
    if (!update.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });
    update.password = await bcrypt.hash(String(update.password), 10);
  }

  if ("profile_photo" in update) {
    update.profile_photo = update.profile_photo
      ? await uploadImage(update.profile_photo, { folder: "bitmax/subadmins/profile" })
      : null;
  }

  if ("company_logo" in update) {
    update.company_logo = update.company_logo
      ? await uploadImage(update.company_logo, { folder: "bitmax/subadmins/company_logo" })
      : null;
  }

  const subadmin = await Admin.findOneAndUpdate({ _id: id, role: "subadmin" }, update, {
    returnDocument: "after",
    runValidators: true
  });
  if (!subadmin) throw Object.assign(new Error("Subadmin not found"), { statusCode: 404 });
  return subadmin;
}

async function deleteSubadmin(id) {
  const subadmin = await Admin.findOneAndDelete({ _id: id, role: "subadmin" });
  if (!subadmin) throw Object.assign(new Error("Subadmin not found"), { statusCode: 404 });
  return subadmin;
}

async function loginSubadmin(email, password) {
  if (!email || !password) throw Object.assign(new Error("email and password are required"), { statusCode: 400 });

  const subadmin = await Admin.findOne({ email: String(email).toLowerCase().trim(), role: "subadmin" }).select("+password");
  if (!subadmin) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const ok = await bcrypt.compare(String(password), subadmin.password);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error("JWT_SECRET is not set in environment"), { statusCode: 500 });

  const token = signJwtHs256(
    {
      sub: String(subadmin._id),
      role: subadmin.role,
      permissions: subadmin.permissions
    },
    secret
  );

  return { subadmin, token };
}

module.exports = {
  createSubadmin,
  listSubadmins,
  getSubadminById,
  updateSubadmin,
  deleteSubadmin,
  loginSubadmin
};
