const evaluationReportService = require("./evaluationreport.service");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  return res.status(statusCode).json({ status: false, message });
}

async function index(req, res) {
  try {
    const result = await evaluationReportService.listReports(req.query);
    return res.status(200).json({
      status: true,
      message: "Evaluation reports fetched successfully.",
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function store(req, res) {
  try {
    const report = await evaluationReportService.createReport(req.body, req.auth);
    return res.status(201).json({
      status: true,
      message: "Evaluation report created successfully.",
      data: report
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function show(req, res) {
  try {
    const report = await evaluationReportService.getReportById(req.params.id);
    return res.status(200).json({
      status: true,
      message: "Evaluation report fetched successfully.",
      data: report
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function update(req, res) {
  try {
    const report = await evaluationReportService.updateReport(req.params.id, req.body);
    return res.status(200).json({
      status: true,
      message: "Evaluation report updated successfully.",
      data: report
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function destroy(req, res) {
  try {
    await evaluationReportService.deleteReport(req.params.id);
    return res.status(200).json({
      status: true,
      message: "Evaluation report deleted successfully."
    });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  index,
  store,
  show,
  update,
  destroy
};
