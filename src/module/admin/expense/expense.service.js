const mongoose = require("mongoose");
const Expense = require("./expense.model");
const Admin = require("../admin/admin.model");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDate(value, fieldName = "date") {
  if (value === null || value === "" || value === undefined) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw Object.assign(new Error(`Invalid ${fieldName}`), { statusCode: 400 });
  return d;
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function startOfLocalWeekMonday(d) {
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const daysSinceMonday = (day + 6) % 7;
  const start = startOfLocalDay(d);
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

function requiredString(value, field) {
  const str = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  if (!str) throw Object.assign(new Error(`${field} is required`), { statusCode: 400 });
  if (str.length > 255) throw Object.assign(new Error(`${field} must be <= 255 chars`), { statusCode: 400 });
  return str;
}

function requiredNumber(value, field) {
  if (value === null || value === undefined || value === "") {
    throw Object.assign(new Error(`${field} is required`), { statusCode: 400 });
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw Object.assign(new Error(`${field} must be a number`), { statusCode: 400 });
  if (n < 0) throw Object.assign(new Error(`${field} must be >= 0`), { statusCode: 400 });
  return n;
}

function pickAllowed(body, allowed) {
  const out = {};
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    out[key] = body[key];
  }
  return out;
}

const FIELDS = ["title", "category", "amount", "date"];

function validateCreatePayload(body) {
  const data = pickAllowed(body, FIELDS);
  data.title = requiredString(data.title, "title");
  data.category = requiredString(data.category, "category");
  data.amount = requiredNumber(data.amount, "amount");
  data.date = normalizeDate(data.date, "date");
  if (!data.date) throw Object.assign(new Error("date is required"), { statusCode: 400 });
  return data;
}

function validateUpdatePayload(body) {
  const update = pickAllowed(body, FIELDS);
  if ("title" in update) update.title = requiredString(update.title, "title");
  if ("category" in update) update.category = requiredString(update.category, "category");
  if ("amount" in update) update.amount = requiredNumber(update.amount, "amount");
  if ("date" in update) {
    update.date = normalizeDate(update.date, "date");
    if (!update.date) throw Object.assign(new Error("date is required"), { statusCode: 400 });
  }
  return update;
}

function shapeExpense(row) {
  const out = { ...row };
  out.id = String(row._id);
  delete out._id;
  delete out.__v;

  const creator = row?.created_by && typeof row.created_by === "object" ? row.created_by : null;
  out.created_by = creator ? String(creator._id) : row.created_by ? String(row.created_by) : null;
  out.creator = creator
    ? {
        id: String(creator._id),
        full_name: creator.full_name ?? null,
        email: creator.email ?? null,
        role: creator.role ?? null
      }
    : null;

  return out;
}

function buildPeriodDateFilter(period) {
  const p = String(period || "").trim().toLowerCase();
  if (!p) return null;

  const now = new Date();
  let start;
  let end;

  if (p === "daily") {
    start = startOfLocalDay(now);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (p === "weekly") {
    start = startOfLocalWeekMonday(now);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else if (p === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  } else if (p === "yearly") {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
  } else {
    throw Object.assign(new Error("period must be one of daily, weekly, monthly, yearly"), { statusCode: 400 });
  }

  return { $gte: start, $lt: end };
}

async function listExpenses(query) {
  const page = Math.max(1, Number(query?.page || 1) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const and = [];

  const dateFilter = buildPeriodDateFilter(query?.period);
  if (dateFilter) and.push({ date: dateFilter });

  const search = String(query?.search || "").trim();
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    const or = [{ title: rx }, { category: rx }];

    const amount = Number(search);
    if (Number.isFinite(amount)) or.push({ amount });

    const maybeDate = new Date(search);
    if (!Number.isNaN(maybeDate.getTime())) {
      const start = startOfLocalDay(maybeDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      or.push({ date: { $gte: start, $lt: end } });
    }

    const creators = await Admin.find({ $or: [{ full_name: rx }, { email: rx }] })
      .select("_id")
      .limit(500)
      .lean();
    const creatorIds = creators.map((c) => c._id);
    if (creatorIds.length) or.push({ created_by: { $in: creatorIds } });

    and.push({ $or: or });
  }

  const filter = and.length ? { $and: and } : {};

  const [total, rows] = await Promise.all([
    Expense.countDocuments(filter),
    Expense.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "created_by", select: "full_name email role" })
      .lean()
  ]);

  const lastPage = Math.max(1, Math.ceil(total / limit));
  return {
    data: rows.map(shapeExpense),
    pagination: {
      current_page: page,
      last_page: lastPage,
      per_page: limit,
      total
    }
  };
}

async function createExpense(body, auth) {
  const data = validateCreatePayload(body);

  const adminId = auth?.sub;
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw Object.assign(new Error("Unauthorized."), { statusCode: 401 });
  }

  const role = String(auth?.role || "").toLowerCase();
  if (role !== "admin" && role !== "subadmin") {
    throw Object.assign(new Error("Unauthorized."), { statusCode: 401 });
  }

  const exists = await Admin.exists({ _id: adminId, role });
  if (!exists) throw Object.assign(new Error("Unauthorized."), { statusCode: 401 });

  const expense = await Expense.create({ ...data, created_by: adminId });
  const row = await Expense.findById(expense._id).populate({ path: "created_by", select: "full_name email role" }).lean();
  return shapeExpense(row);
}

async function getExpenseById(id) {
  const row = await Expense.findById(id).populate({ path: "created_by", select: "full_name email role" }).lean();
  if (!row) throw Object.assign(new Error("Expense not found."), { statusCode: 404 });
  return shapeExpense(row);
}

async function updateExpense(id, body) {
  const update = validateUpdatePayload(body);
  const row = await Expense.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true })
    .populate({ path: "created_by", select: "full_name email role" })
    .lean();
  if (!row) throw Object.assign(new Error("Expense not found."), { statusCode: 404 });
  return shapeExpense(row);
}

async function deleteExpense(id) {
  const row = await Expense.findByIdAndDelete(id).lean();
  if (!row) throw Object.assign(new Error("Expense not found."), { statusCode: 404 });
  return true;
}

module.exports = {
  listExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense
};
