const Attendence = require("../../admin/Attendence/attendence.model");
const Report = require("../report/report.model"); // adjust path

const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA");
  const time = now.toTimeString().split(" ")[0];
  return { date, time };
};

// MARK IN
const markInService = async (employee_id, profile_image) => {
  const { date, time } = getCurrentDateTime();
  let record = await Attendence.findOne({ employee_id, date });

  if (!record) {
    record = await Attendence.create({
      employee_id,
      date,
      mark_in: time,
      first_mark_in: time,
      profile_image
    });
  } else {
    if (record.mark_in) throw new Error("You have already marked in today.");
    record.mark_in = time;
    if (!record.first_mark_in) record.first_mark_in = time;
    if (profile_image) record.profile_image = profile_image;
    await record.save();
  }

  return record;
};

// MARK OUT (requires image and status)
const markOutService = async (employee_id, profile_image, status) => {
  const { date, time } = getCurrentDateTime();
  const record = await Attendence.findOne({ employee_id, date });

  if (!record || !record.mark_in) throw new Error("You must mark in first.");
  
  // If break was started but not ended, prevent mark out
  if (record.break_start && !record.break_end)
    throw new Error("You must end your break before marking out.");

  if (record.mark_out) throw new Error("You have already marked out today.");

  record.mark_out = time;
  if (!record.first_mark_out) record.first_mark_out = time;

  if (profile_image) record.profile_image = profile_image; // save new image
  await record.save();

  // Update report with the status provided by the user
  let report = await Report.findOne({ employee_id, date });
  if (!report) {
    report = await Report.create({ employee_id, date, status });
  } else {
    report.status = status;
    await report.save();
  }

  return record;
};

// START BREAK
const startBreakService = async (employee_id, profile_image) => {
  const { date, time } = getCurrentDateTime();
  const record = await Attendence.findOne({ employee_id, date });

  if (!record || !record.mark_in) throw new Error("You must mark in first.");
  if (record.break_start) throw new Error("Break already started.");
  if (record.mark_out) throw new Error("You cannot start a break after marking out.");

  record.break_start = time;
  if (!record.first_break_start) record.first_break_start = time;
  if (profile_image) record.profile_image = profile_image;

  await record.save();
  return record;
};

// END BREAK
const endBreakService = async (employee_id, profile_image) => {
  const { date, time } = getCurrentDateTime();
  const record = await Attendence.findOne({ employee_id, date });

  if (!record || !record.mark_in) throw new Error("You must mark in first.");
  if (!record.break_start) throw new Error("You must start a break first.");
  if (record.break_end) throw new Error("Break already ended.");
  if (record.mark_out) throw new Error("You cannot end a break after marking out.");

  record.break_end = time;
  if (!record.first_break_end) record.first_break_end = time;
  if (profile_image) record.profile_image = profile_image;

  await record.save();
  return record;
};


module.exports = {
  markInService,
  markOutService,
  startBreakService,
  endBreakService
};