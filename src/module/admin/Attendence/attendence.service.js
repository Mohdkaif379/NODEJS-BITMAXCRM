const mongoose = require("mongoose");
const Attendence = require("./attendence.model");
const Employee = require("../employee/employee.model");
const { uploadImage } = require("../../../core/config/cloudinary");

const TIME_ZONE = "Asia/Kolkata";
const MARK_IN_CUTOFF = "09:35:00";
const MARK_OUT_CUTOFF = "18:30:00";

function pickString(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function isValidTime(value) {
  if (value === null || value === undefined || value === "") return true;
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(String(value));
}

function assertTime(value, field) {
  if (!isValidTime(value)) throw Object.assign(new Error(`${field} is invalid (expected HH:mm:ss)`), { statusCode: 400 });
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}

function assertDateString(value, field) {
  if (!isValidDateString(value)) throw Object.assign(new Error(`${field} is invalid (expected YYYY-MM-DD)`), { statusCode: 400 });
}

function isSunday(dateStr) {
  // Tomohiko Sakamoto algorithm: returns 0=Sunday..6=Saturday
  assertDateString(dateStr, "date");
  const [yRaw, mRaw, dRaw] = dateStr.split("-").map((n) => Number(n));
  let y = yRaw;
  const m = mRaw;
  const d = dRaw;
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  if (m < 3) y -= 1;
  const dow = (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + d) % 7;
  return dow === 0;
}

function getDatePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const out = {};
  for (const p of parts) {
    if (p.type === "year") out.year = p.value;
    if (p.type === "month") out.month = p.value;
    if (p.type === "day") out.day = p.value;
    if (p.type === "hour") out.hour = p.value;
    if (p.type === "minute") out.minute = p.value;
    if (p.type === "second") out.second = p.value;
  }
  return out;
}

function nowDateString() {
  const p = getDatePartsInTimeZone(new Date(), TIME_ZONE);
  return `${p.year}-${p.month}-${p.day}`;
}

function nowTimeString() {
  const p = getDatePartsInTimeZone(new Date(), TIME_ZONE);
  return `${p.hour}:${p.minute}:${p.second}`;
}

function addDays(dateStr, deltaDays) {
  assertDateString(dateStr, "date");
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + Number(deltaDays));
  const yy = String(base.getUTCFullYear()).padStart(4, "0");
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function getWeekRange(dateStr) {
  assertDateString(dateStr, "date");
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  const base = new Date(Date.UTC(y, m - 1, d));
  const day = base.getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (day + 6) % 7;
  const start = addDays(dateStr, -daysSinceMonday);
  const end = addDays(start, 6);
  return { start, end };
}

function resolveAttendanceStatus({ date, markIn, markOut, currentStatus = null }) {
  if (date && isSunday(date)) return "holiday";
  if (currentStatus === "absent" || currentStatus === "holiday") return currentStatus;
  if (!markIn) return "absent";
  if (!markOut) return markIn <= MARK_IN_CUTOFF ? "present" : "halfday";
  return markIn <= MARK_IN_CUTOFF && markOut >= MARK_OUT_CUTOFF ? "present" : "halfday";
}

async function maybeUpload(value, folder) {
  const v = pickString(value);
  if (!v) return null;
  return uploadImage(v, { folder });
}

function transformAttendence(doc) {
  if (!doc) return doc;
  const data = typeof doc.toObject === "function" ? doc.toObject() : doc;

  return {
    ...data,
    marked_at: {
      mark_in: data.first_mark_in || data.mark_in || null,
      start_break: data.first_break_start || data.break_start || null,
      break_out: data.first_break_end || data.break_end || null,
      mark_out: data.first_mark_out || data.mark_out || null
    }
  };
}

async function indexAttendence({ filter = null, page = 1, per_page = 10 } = {}) {
  const p = Number(page) || 1;
  const limit = Math.min(Math.max(Number(per_page) || 10, 1), 100);
  const skip = (Math.max(p, 1) - 1) * limit;

  const query = {};
  const today = nowDateString();

  if (filter === "daily") {
    const [total, employees] = await Promise.all([
      Employee.countDocuments({}),
      Employee.find({})
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const employeeIds = employees.map((e) => e._id);
    const attendences = await Attendence.find({ employee_id: { $in: employeeIds }, date: today }).lean();
    const mapByEmployeeId = new Map(attendences.map((a) => [String(a.employee_id), a]));

    const data = employees.map((employee) => {
      const attendance = mapByEmployeeId.get(String(employee._id)) || null;
      const status = attendance
        ? resolveAttendanceStatus({
            date: today,
            markIn: attendance.mark_in,
            markOut: attendance.mark_out,
            currentStatus: attendance.status
          })
        : isSunday(today)
          ? "holiday"
          : "absent";

      const out = attendance
        ? transformAttendence(attendance)
        : {
            employee: null,
            date: today,
            mark_in: null,
            mark_out: null,
            break_start: null,
            break_end: null,
            first_mark_in: null,
            first_mark_out: null,
            first_break_start: null,
            first_break_end: null,
            profile_image: null
          };

      out.employee = employee;
      out.employee_id = employee._id;
      out.status = status;
      return out;
    });

    return {
      data,
      pagination: {
        current_page: Math.max(p, 1),
        last_page: Math.max(Math.ceil(total / limit), 1),
        per_page: limit,
        total
      }
    };
  } else if (filter === "weekly") {
    const { start, end } = getWeekRange(today);
    query.date = { $gte: start, $lte: end };
  } else if (filter === "monthly") {
    const prefix = today.slice(0, 7); // YYYY-MM
    query.date = { $regex: new RegExp(`^${prefix}-`) };
  } else if (filter === "yearly") {
    const prefix = today.slice(0, 4); // YYYY
    query.date = { $regex: new RegExp(`^${prefix}-`) };
  } else if (filter !== null && filter !== undefined) {
    throw Object.assign(new Error("filter must be one of: daily, weekly, monthly, yearly"), { statusCode: 400 });
  }

  const [total, rows] = await Promise.all([
    Attendence.countDocuments(query),
    Attendence.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("employee_id")
  ]);

  const data = rows.map((r) => {
    const x = transformAttendence(r);
    x.employee = x.employee_id || null;
    delete x.employee_id;
    x.status = resolveAttendanceStatus({
      date: x.date,
      markIn: x.mark_in,
      markOut: x.mark_out,
      currentStatus: x.status
    });
    return x;
  });

  return {
    data,
    pagination: {
      current_page: Math.max(p, 1),
      last_page: Math.max(Math.ceil(total / limit), 1),
      per_page: limit,
      total
    }
  };
}

function buildDateRange(from, to) {
  assertDateString(from, "from");
  assertDateString(to, "to");
  if (from > to) throw Object.assign(new Error("from must be <= to"), { statusCode: 400 });

  const dates = [];
  let cur = from;
  for (let i = 0; i < 400; i++) {
    dates.push(cur);
    if (cur === to) break;
    cur = addDays(cur, 1);
  }
  if (dates[dates.length - 1] !== to) {
    throw Object.assign(new Error("Date range too large"), { statusCode: 400 });
  }
  return dates;
}

async function getAttendenceByEmployee(employeeId, { from = null, to = null } = {}) {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw Object.assign(new Error("Invalid employee_id"), { statusCode: 400 });
  }

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) throw Object.assign(new Error("Employee not found"), { statusCode: 404 });

  if (from || to) {
    if (!from || !to) throw Object.assign(new Error("from and to are required together"), { statusCode: 400 });
    const dates = buildDateRange(from, to);
    const rows = await Attendence.find({ employee_id: employeeId, date: { $gte: from, $lte: to } }).lean();
    const byDate = new Map(rows.map((r) => [r.date, r]));

    const out = dates
      .map((date) => {
        const row = byDate.get(date);
        if (!row) {
          return {
            employee,
            employee_id: employee._id,
            date,
            mark_in: null,
            mark_out: null,
            break_start: null,
            break_end: null,
            first_mark_in: null,
            first_mark_out: null,
            first_break_start: null,
            first_break_end: null,
            profile_image: null,
            status: isSunday(date) ? "holiday" : "absent",
            marked_at: { mark_in: null, start_break: null, break_out: null, mark_out: null }
          };
        }

        const x = transformAttendence(row);
        x.employee = employee;
        x.employee_id = employee._id;
        x.status = resolveAttendanceStatus({
          date,
          markIn: x.mark_in,
          markOut: x.mark_out,
          currentStatus: x.status
        });
        return x;
      })
      .reverse(); // latest first

    return out;
  }

  const rows = await Attendence.find({ employee_id: employeeId }).sort({ created_at: -1 }).lean();
  return rows.map((r) => {
    const x = transformAttendence(r);
    x.employee = employee;
    x.employee_id = employee._id;
    x.status = resolveAttendanceStatus({
      date: x.date,
      markIn: x.mark_in,
      markOut: x.mark_out,
      currentStatus: x.status
    });
    return x;
  });
}

async function markIn({ employee_id, profile_image } = {}) {
  if (!mongoose.Types.ObjectId.isValid(employee_id)) throw Object.assign(new Error("employee_id is required"), { statusCode: 400 });

  const today = nowDateString();
  const time = nowTimeString();

  const attendance = await Attendence.findOne({ employee_id, date: today });
  if (attendance?.mark_in) throw Object.assign(new Error("Mark in already done for today."), { statusCode: 422 });

  const doc =
    attendance ||
    new Attendence({
      employee_id,
      date: today
    });

  doc.mark_in = time;
  if (!doc.first_mark_in) doc.first_mark_in = time;
  doc.status = isSunday(today) ? "holiday" : doc.mark_in <= MARK_IN_CUTOFF ? "present" : "halfday";

  if (profile_image !== undefined) {
    doc.profile_image = profile_image ? await maybeUpload(profile_image, "bitmax/attendence/mark_in") : null;
  }

  await doc.save();
  await doc.populate("employee_id");

  const out = transformAttendence(doc);
  out.employee = out.employee_id || null;
  delete out.employee_id;
  return out;
}

async function markOut({ employee_id, profile_image } = {}) {
  if (!mongoose.Types.ObjectId.isValid(employee_id)) throw Object.assign(new Error("employee_id is required"), { statusCode: 400 });

  const today = nowDateString();
  const attendance = await Attendence.findOne({ employee_id, date: today });

  if (!attendance || !attendance.mark_in) throw Object.assign(new Error("Please mark in first."), { statusCode: 422 });
  if (attendance.mark_out) throw Object.assign(new Error("Mark out already done for today."), { statusCode: 422 });

  const time = nowTimeString();
  attendance.mark_out = time;
  if (!attendance.first_mark_out) attendance.first_mark_out = time;

  attendance.status = isSunday(today)
    ? "holiday"
    : attendance.mark_in <= MARK_IN_CUTOFF && attendance.mark_out >= MARK_OUT_CUTOFF
      ? "present"
      : "halfday";

  if (profile_image !== undefined) {
    attendance.profile_image = profile_image ? await maybeUpload(profile_image, "bitmax/attendence/mark_out") : null;
  }

  await attendance.save();
  await attendance.populate("employee_id");

  const out = transformAttendence(attendance);
  out.employee = out.employee_id || null;
  delete out.employee_id;
  return out;
}

async function breakStart({ employee_id, profile_image } = {}) {
  if (!mongoose.Types.ObjectId.isValid(employee_id)) throw Object.assign(new Error("employee_id is required"), { statusCode: 400 });

  const today = nowDateString();
  const attendance = await Attendence.findOne({ employee_id, date: today });

  if (!attendance || !attendance.mark_in) throw Object.assign(new Error("Please mark in first."), { statusCode: 422 });
  if (attendance.mark_out) throw Object.assign(new Error("Break cannot start after mark out."), { statusCode: 422 });
  if (attendance.break_start) throw Object.assign(new Error("Break start already."), { statusCode: 422 });

  const time = nowTimeString();
  attendance.break_start = time;
  if (!attendance.first_break_start) attendance.first_break_start = time;
  if (isSunday(today)) attendance.status = "holiday";

  if (profile_image !== undefined) {
    attendance.profile_image = profile_image ? await maybeUpload(profile_image, "bitmax/attendence/break_start") : null;
  }

  await attendance.save();
  await attendance.populate("employee_id");

  const out = transformAttendence(attendance);
  out.employee = out.employee_id || null;
  delete out.employee_id;
  return out;
}

async function breakEnd({ employee_id, profile_image } = {}) {
  if (!mongoose.Types.ObjectId.isValid(employee_id)) throw Object.assign(new Error("employee_id is required"), { statusCode: 400 });

  const today = nowDateString();
  const attendance = await Attendence.findOne({ employee_id, date: today });

  if (!attendance || !attendance.mark_in) throw Object.assign(new Error("Please mark in first."), { statusCode: 422 });
  if (!attendance.break_start) throw Object.assign(new Error("Please mark break start first."), { statusCode: 422 });
  if (attendance.break_end) throw Object.assign(new Error("Break end already marked."), { statusCode: 422 });

  const time = nowTimeString();
  attendance.break_end = time;
  if (!attendance.first_break_end) attendance.first_break_end = time;
  if (isSunday(today)) attendance.status = "holiday";

  if (profile_image !== undefined) {
    attendance.profile_image = profile_image ? await maybeUpload(profile_image, "bitmax/attendence/break_end") : null;
  }

  await attendance.save();
  await attendance.populate("employee_id");

  const out = transformAttendence(attendance);
  out.employee = out.employee_id || null;
  delete out.employee_id;
  return out;
}

function pickAttendenceUpdateFields(body) {
  const update = {};
  const allowed = ["employee_id", "date", "mark_in", "mark_out", "break_start", "break_end", "profile_image", "status"];
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }
  return update;
}

async function updateAttendence(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw Object.assign(new Error("Invalid id"), { statusCode: 400 });
  const update = pickAttendenceUpdateFields(body);

  if (!update.employee_id || !mongoose.Types.ObjectId.isValid(update.employee_id)) {
    throw Object.assign(new Error("employee_id is required"), { statusCode: 400 });
  }

  if ("date" in update) {
    if (update.date !== null && update.date !== "") assertDateString(update.date, "date");
    update.date = pickString(update.date);
  }

  if ("mark_in" in update) {
    update.mark_in = pickString(update.mark_in);
    assertTime(update.mark_in, "mark_in");
  }
  if ("mark_out" in update) {
    update.mark_out = pickString(update.mark_out);
    assertTime(update.mark_out, "mark_out");
  }
  if ("break_start" in update) {
    update.break_start = pickString(update.break_start);
    assertTime(update.break_start, "break_start");
  }
  if ("break_end" in update) {
    update.break_end = pickString(update.break_end);
    assertTime(update.break_end, "break_end");
  }

  if ("profile_image" in update) {
    update.profile_image = update.profile_image ? await maybeUpload(update.profile_image, "bitmax/attendence/edit") : null;
  }

  const attendance = await Attendence.findOne({ _id: id, employee_id: update.employee_id });
  if (!attendance) throw Object.assign(new Error("Attendance not found for this employee."), { statusCode: 404 });

  if ("date" in update) attendance.date = update.date || attendance.date;
  if ("mark_in" in update) attendance.mark_in = update.mark_in;
  if ("mark_out" in update) attendance.mark_out = update.mark_out;
  if ("break_start" in update) attendance.break_start = update.break_start;
  if ("break_end" in update) attendance.break_end = update.break_end;
  if ("profile_image" in update) attendance.profile_image = update.profile_image;

  // status backend-controlled:
  // - allow only "absent" / "holiday" to be set manually
  // - for present/halfday, always compute from mark_in/mark_out
  if ("status" in update && (update.status === "absent" || update.status === "holiday")) {
    attendance.status = update.status;
  } else {
    attendance.status = resolveAttendanceStatus({
      date: attendance.date,
      markIn: attendance.mark_in,
      markOut: attendance.mark_out,
      currentStatus: attendance.status
    });
  }

  await attendance.save();
  await attendance.populate("employee_id");

  const out = transformAttendence(attendance);
  out.employee = out.employee_id || null;
  delete out.employee_id;
  return out;
}

async function deleteAttendence(id) {
  const attendance = await Attendence.findByIdAndDelete(id);
  if (!attendance) throw Object.assign(new Error("Attendance not found."), { statusCode: 404 });
  return attendance;
}
function getMonthIndex(monthName) {
  const months = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12"
  };

  return months[String(monthName).toLowerCase()];
}

async function getMonthlyAttendence(employee_id, month, year) {
  if (!mongoose.Types.ObjectId.isValid(employee_id)) {
    throw Object.assign(new Error("Invalid employee_id"), { statusCode: 400 });
  }

  if (!month || !year) {
    throw Object.assign(new Error("month and year are required"), { statusCode: 400 });
  }

  const monthMap = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12"
  };

  const monthNumber = monthMap[month.toLowerCase()];
  if (!monthNumber) {
    throw Object.assign(new Error("Invalid month name"), { statusCode: 400 });
  }

  const prefix = `${year}-${monthNumber}`;

  const employee = await Employee.findById(employee_id).lean();
  if (!employee) {
    throw Object.assign(new Error("Employee not found"), { statusCode: 404 });
  }

  // 🔹 get all dates of month
  const daysInMonth = new Date(year, parseInt(monthNumber), 0).getDate();
  const allDates = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const day = String(i).padStart(2, "0");
    allDates.push(`${year}-${monthNumber}-${day}`);
  }

  const rows = await Attendence.find({
    employee_id,
    date: { $regex: new RegExp(`^${prefix}-`) }
  }).lean();

  const mapByDate = new Map(rows.map((r) => [r.date, r]));

  // 🔹 counters
  let present = 0;
  let halfday = 0;
  let absent = 0;
  let holiday = 0;

  const data = allDates.map((date) => {
    const row = mapByDate.get(date);

    if (!row) {
      const status = isSunday(date) ? "holiday" : "absent";

      if (status === "holiday") holiday++;
      else absent++;

      return {
        employee,
        employee_id,
        date,
        mark_in: null,
        mark_out: null,
        break_start: null,
        break_end: null,
        status,
        marked_at: {
          mark_in: null,
          start_break: null,
          break_out: null,
          mark_out: null
        }
      };
    }

    const x = transformAttendence(row);
    x.employee = employee;
    x.employee_id = employee_id;

    const status = resolveAttendanceStatus({
      date,
      markIn: x.mark_in,
      markOut: x.mark_out,
      currentStatus: x.status
    });

    x.status = status;

    // count increment
    if (status === "present") present++;
    else if (status === "halfday") halfday++;
    else if (status === "holiday") holiday++;
    else absent++;

    return x;
  });

  return {
    summary: {
      total_days: daysInMonth,
      present,
      halfday,
      absent,
      holiday
    },
    data
  };
}

module.exports = {
  indexAttendence,
  getAttendenceByEmployee,
  markIn,
  markOut,
  breakStart,
  breakEnd,
  updateAttendence,
  deleteAttendence,
  getMonthlyAttendence
};
