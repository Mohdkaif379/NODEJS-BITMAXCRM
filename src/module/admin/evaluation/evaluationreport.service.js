const mongoose = require("mongoose");
const EvaluationReport = require("./evaluationreport.model");
const Employee = require("../employee/employee.model");
const Admin = require("../admin/admin.model");

function normalizeDate(value, fieldName = "date") {
  if (value === null || value === "" || value === undefined) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw Object.assign(new Error(`Invalid ${fieldName}`), { statusCode: 400 });
  return d;
}

function dayRangeUtc(value, fieldName) {
  const d = normalizeDate(value, fieldName);
  if (!d) return null;
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function requiredString(value, field) {
  const str = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  if (!str) throw Object.assign(new Error(`${field} is required`), { statusCode: 400 });
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

const FIELDS = [
  "employee_id",
  "period_to",
  "period_from",
  "evaluation_date",
  "delivery_updates",
  "quality_standards",
  "application_performance",
  "completion_accuracy",
  "innovation_problems",
  "task_efficiency",
  "ui_ux_completion",
  "debug_testing",
  "version_control",
  "document_quality",
  "manager_comments",
  "collaboration_teamwork",
  "communicate_reports",
  "attendence_punctuality",
  "professionalism",
  "team_collaboration",
  "learning_adaptability",
  "initiate_ownership",
  "team_management",
  "hr_comments",
  "skills",
  "task_delivery",
  "quality_work",
  "communication",
  "behaviour_teamwork",
  "performance_grade",
  "final_feedback"
];

function validateCreatePayload(body) {
  const data = pickAllowed(body, FIELDS);

  if (!mongoose.Types.ObjectId.isValid(data.employee_id)) {
    throw Object.assign(new Error("employee_id is invalid"), { statusCode: 400 });
  }

  data.period_to = normalizeDate(data.period_to, "period_to");
  data.period_from = normalizeDate(data.period_from, "period_from");
  data.evaluation_date = normalizeDate(data.evaluation_date, "evaluation_date");
  if (!data.period_to) throw Object.assign(new Error("period_to is required"), { statusCode: 400 });
  if (!data.period_from) throw Object.assign(new Error("period_from is required"), { statusCode: 400 });
  if (!data.evaluation_date) throw Object.assign(new Error("evaluation_date is required"), { statusCode: 400 });
  if (data.period_from.getTime() > data.period_to.getTime()) {
    throw Object.assign(new Error("period_from must be before or equal to period_to"), { statusCode: 400 });
  }

  for (const key of [
    "delivery_updates",
    "quality_standards",
    "application_performance",
    "completion_accuracy",
    "innovation_problems",
    "manager_comments",
    "collaboration_teamwork",
    "communicate_reports",
    "attendence_punctuality",
    "hr_comments",
    "performance_grade",
    "final_feedback"
  ]) {
    data[key] = requiredString(data[key], key);
  }

  for (const key of [
    "task_efficiency",
    "ui_ux_completion",
    "debug_testing",
    "version_control",
    "document_quality",
    "professionalism",
    "team_collaboration",
    "learning_adaptability",
    "initiate_ownership",
    "team_management",
    "skills",
    "task_delivery",
    "quality_work",
    "communication",
    "behaviour_teamwork"
  ]) {
    data[key] = requiredNumber(data[key], key);
  }

  if (String(data.performance_grade).length > 100) {
    throw Object.assign(new Error("performance_grade must be <= 100 chars"), { statusCode: 400 });
  }

  return data;
}

function validateUpdatePayload(body) {
  const update = pickAllowed(body, FIELDS);

  if ("employee_id" in update) {
    if (!mongoose.Types.ObjectId.isValid(update.employee_id)) {
      throw Object.assign(new Error("employee_id is invalid"), { statusCode: 400 });
    }
  }

  if ("period_to" in update) update.period_to = normalizeDate(update.period_to, "period_to");
  if ("period_from" in update) update.period_from = normalizeDate(update.period_from, "period_from");
  if ("evaluation_date" in update) update.evaluation_date = normalizeDate(update.evaluation_date, "evaluation_date");

  for (const key of [
    "delivery_updates",
    "quality_standards",
    "application_performance",
    "completion_accuracy",
    "innovation_problems",
    "manager_comments",
    "collaboration_teamwork",
    "communicate_reports",
    "attendence_punctuality",
    "hr_comments",
    "performance_grade",
    "final_feedback"
  ]) {
    if (!(key in update)) continue;
    update[key] = requiredString(update[key], key);
    if (key === "performance_grade" && String(update[key]).length > 100) {
      throw Object.assign(new Error("performance_grade must be <= 100 chars"), { statusCode: 400 });
    }
  }

  for (const key of [
    "task_efficiency",
    "ui_ux_completion",
    "debug_testing",
    "version_control",
    "document_quality",
    "professionalism",
    "team_collaboration",
    "learning_adaptability",
    "initiate_ownership",
    "team_management",
    "skills",
    "task_delivery",
    "quality_work",
    "communication",
    "behaviour_teamwork"
  ]) {
    if (!(key in update)) continue;
    update[key] = requiredNumber(update[key], key);
  }

  return update;
}

async function ensureEmployeeExists(employeeId) {
  const exists = await Employee.exists({ _id: employeeId });
  if (!exists) throw Object.assign(new Error("Employee not found"), { statusCode: 400 });
}

function shapeReport(row) {
  const employee = row?.employee_id || null;
  const employeeData =
    employee && typeof employee === "object"
      ? {
          id: String(employee._id),
          emp_code: employee.emp_code ?? null,
          emp_name: employee.emp_name ?? null,
          emp_email: employee.emp_email ?? null
        }
      : null;

  const out = { ...row };
  out.id = String(row._id);
  delete out._id;
  delete out.__v;

  if (!row.employee_id) out.employee_id = null;
  else out.employee_id = row.employee_id?._id ? String(row.employee_id._id) : String(row.employee_id);
  out.employee = employeeData;
  if (out.created_by && typeof out.created_by === "object") out.created_by = String(out.created_by._id || out.created_by);

  return out;
}

async function listReports(query) {
  const page = Math.max(1, Number(query?.page || 1) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query?.employee_id) {
    if (!mongoose.Types.ObjectId.isValid(query.employee_id)) {
      throw Object.assign(new Error("employee_id is invalid"), { statusCode: 400 });
    }
    filter.employee_id = query.employee_id;
  }

  if (query?.period_from) {
    const r = dayRangeUtc(query.period_from, "period_from");
    filter.period_from = { ...(filter.period_from || {}), $gte: r.start };
  }

  if (query?.period_to) {
    const r = dayRangeUtc(query.period_to, "period_to");
    filter.period_to = { ...(filter.period_to || {}), $lt: r.end };
  }

  if (query?.evaluation_date) {
    const r = dayRangeUtc(query.evaluation_date, "evaluation_date");
    filter.evaluation_date = { $gte: r.start, $lt: r.end };
  }

  if (query?.performance_grade) {
    filter.performance_grade = String(query.performance_grade).trim();
  }

  const search = String(query?.search || "").trim();
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const employees = await Employee.find({ $or: [{ emp_name: rx }, { emp_email: rx }, { emp_code: rx }] })
      .select("_id")
      .limit(500)
      .lean();
    const employeeIds = employees.map((e) => e._id);

    filter.$or = [
      ...(employeeIds.length ? [{ employee_id: { $in: employeeIds } }] : []),
      { performance_grade: rx },
      { manager_comments: rx },
      { hr_comments: rx },
      { final_feedback: rx }
    ];
  }

  const [total, rows] = await Promise.all([
    EvaluationReport.countDocuments(filter),
    EvaluationReport.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "employee_id", select: "emp_code emp_name emp_email" })
      .lean()
  ]);

  const lastPage = Math.max(1, Math.ceil(total / limit));
  return {
    data: rows.map(shapeReport),
    pagination: {
      current_page: page,
      last_page: lastPage,
      per_page: limit,
      total
    }
  };
}

async function createReport(body, auth) {
  const data = validateCreatePayload(body);

  await ensureEmployeeExists(data.employee_id);

  let createdBy = null;
  const role = String(auth?.role || "");
  if (role === "admin" || role === "subadmin") {
    const adminId = auth?.sub;
    if (mongoose.Types.ObjectId.isValid(adminId)) {
      const ok = await Admin.exists({ _id: adminId });
      if (ok) createdBy = adminId;
    }
  }

  const report = await EvaluationReport.create({ ...data, created_by: createdBy });
  const row = await EvaluationReport.findById(report._id)
    .populate({ path: "employee_id", select: "emp_code emp_name emp_email" })
    .lean();
  return shapeReport(row);
}

async function getReportById(id) {
  const row = await EvaluationReport.findById(id)
    .populate({ path: "employee_id", select: "emp_code emp_name emp_email" })
    .lean();
  if (!row) throw Object.assign(new Error("Evaluation report not found"), { statusCode: 404 });
  return shapeReport(row);
}

async function updateReport(id, body) {
  const update = validateUpdatePayload(body);

  if ("employee_id" in update) await ensureEmployeeExists(update.employee_id);

  if ("period_from" in update || "period_to" in update) {
    const current = await EvaluationReport.findById(id).select("period_from period_to").lean();
    if (!current) throw Object.assign(new Error("Evaluation report not found"), { statusCode: 404 });
    const from = update.period_from ?? current.period_from;
    const to = update.period_to ?? current.period_to;
    if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
      throw Object.assign(new Error("period_from must be before or equal to period_to"), { statusCode: 400 });
    }
  }

  const row = await EvaluationReport.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true })
    .populate({ path: "employee_id", select: "emp_code emp_name emp_email" })
    .lean();
  if (!row) throw Object.assign(new Error("Evaluation report not found"), { statusCode: 404 });
  return shapeReport(row);
}

async function deleteReport(id) {
  const row = await EvaluationReport.findByIdAndDelete(id).lean();
  if (!row) throw Object.assign(new Error("Evaluation report not found"), { statusCode: 404 });
  return true;
}

module.exports = {
  listReports,
  createReport,
  getReportById,
  updateReport,
  deleteReport
};
