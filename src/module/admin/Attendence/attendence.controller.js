const attendenceService = require("./attendence.service");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  return res.status(statusCode).json({ status: false, message });
}

async function index(req, res) {
  try {
    const { data, pagination } = await attendenceService.indexAttendence({
      filter: req.query?.filter ?? null,
      page: req.query?.page ?? 1,
      per_page: req.query?.per_page ?? 10
    });

    return res.status(200).json({
      status: true,
      message: "Attendances fetched successfully.",
      data,
      pagination
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function showByEmployee(req, res) {
  try {
    const data = await attendenceService.getAttendenceByEmployee(req.params.employee_id, {
      from: req.query?.from ?? null,
      to: req.query?.to ?? null
    });
    return res.status(200).json({
      status: true,
      message: "Employee attendances fetched successfully.",
      data
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function markIn(req, res) {
  try {
    const data = await attendenceService.markIn({
      employee_id: req.body?.employee_id,
      profile_image: req.body?.profile_image
    });
    return res.status(200).json({ status: true, message: "Mark in successful.", data });
  } catch (err) {
    return sendError(res, err);
  }
}

async function markOut(req, res) {
  try {
    const data = await attendenceService.markOut({
      employee_id: req.body?.employee_id,
      profile_image: req.body?.profile_image
    });
    return res.status(200).json({ status: true, message: "Mark out successful.", data });
  } catch (err) {
    return sendError(res, err);
  }
}

async function breakStart(req, res) {
  try {
    const data = await attendenceService.breakStart({
      employee_id: req.body?.employee_id,
      profile_image: req.body?.profile_image
    });
    return res.status(200).json({ status: true, message: "Break start successful.", data });
  } catch (err) {
    return sendError(res, err);
  }
}

async function breakEnd(req, res) {
  try {
    const data = await attendenceService.breakEnd({
      employee_id: req.body?.employee_id,
      profile_image: req.body?.profile_image
    });
    return res.status(200).json({ status: true, message: "Break end successful.", data });
  } catch (err) {
    return sendError(res, err);
  }
}

async function update(req, res) {
  try {
    const data = await attendenceService.updateAttendence(req.params.id, req.body);
    return res.status(200).json({ status: true, message: "Attendance updated successfully.", data });
  } catch (err) {
    return sendError(res, err);
  }
}

async function destroy(req, res) {
  try {
    await attendenceService.deleteAttendence(req.params.id);
    return res.status(200).json({ status: true, message: "Attendance deleted successfully." });
  } catch (err) {
    return sendError(res, err);
  }
}
async function monthlyAttendence(req, res) {
  try {
    const { employee_id, month, year } = req.query;

    const result = await attendenceService.getMonthlyAttendence(
      employee_id,
      month,
      year
    );

    return res.status(200).json({
      status: true,
      message: "Monthly attendance fetched successfully.",
      ...result
    });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  index,
  showByEmployee,
  markIn,
  markOut,
  breakStart,
  breakEnd,
  update,
  destroy,
  monthlyAttendence
};
