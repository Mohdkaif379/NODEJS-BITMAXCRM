const crypto = require("crypto");
const Visitor = require("./visitor.model");

function generateInviteCode() {
  return crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12);
}

function normalizeVisitDate(value) {
  if (value === null || value === "" || value === undefined) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw Object.assign(new Error("visit_date is invalid"), { statusCode: 400 });
  return d;
}

function pickVisitorCreateFields(body) {
  return {
    name: body?.name,
    email: body?.email,
    phone: body?.phone ?? null,
    contact_person_name: body?.contact_person_name ?? null,
    contact_person_phone: body?.contact_person_phone ?? null,
    purpose: body?.purpose ?? null,
    visit_date: body?.visit_date ?? null,
    invite_code: body?.invite_code ?? null
  };
}

function pickVisitorUpdateFields(body) {
  const update = {};
  const allowed = [
    "name",
    "email",
    "phone",
    "contact_person_name",
    "contact_person_phone",
    "purpose",
    "visit_date",
    "invite_code"
  ];

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }

  return update;
}

async function createVisitor(body) {
  const data = pickVisitorCreateFields(body);

  if (!data.name) throw Object.assign(new Error("name is required"), { statusCode: 400 });
  if (!data.email) throw Object.assign(new Error("email is required"), { statusCode: 400 });

  const inviteCode = data.invite_code ? String(data.invite_code).trim() : generateInviteCode();

  const visitor = await Visitor.create({
    ...data,
    email: String(data.email).toLowerCase().trim(),
    invite_code: inviteCode,
    visit_date: normalizeVisitDate(data.visit_date)
  });

  return visitor;
}

async function listVisitors(filter = {}) {
  const query = {};
  if (filter.email) query.email = String(filter.email).toLowerCase().trim();
  if (filter.invite_code) query.invite_code = String(filter.invite_code).trim();
  return Visitor.find(query).sort({ created_at: -1 });
}

async function getVisitorById(id) {
  const visitor = await Visitor.findById(id);
  if (!visitor) throw Object.assign(new Error("Visitor not found"), { statusCode: 404 });
  return visitor;
}

async function getVisitorByInviteCode(inviteCode) {
  const visitor = await Visitor.findOne({ invite_code: String(inviteCode).trim() });
  if (!visitor) throw Object.assign(new Error("Visitor not found"), { statusCode: 404 });
  return visitor;
}

async function updateVisitor(id, body) {
  const update = pickVisitorUpdateFields(body);

  if ("email" in update) update.email = String(update.email).toLowerCase().trim();
  if ("visit_date" in update) update.visit_date = normalizeVisitDate(update.visit_date);
  if ("invite_code" in update && update.invite_code) update.invite_code = String(update.invite_code).trim();

  const visitor = await Visitor.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
  if (!visitor) throw Object.assign(new Error("Visitor not found"), { statusCode: 404 });
  return visitor;
}

async function deleteVisitor(id) {
  const visitor = await Visitor.findByIdAndDelete(id);
  if (!visitor) throw Object.assign(new Error("Visitor not found"), { statusCode: 404 });
  return visitor;
}

module.exports = {
  createVisitor,
  listVisitors,
  getVisitorById,
  getVisitorByInviteCode,
  updateVisitor,
  deleteVisitor
};
