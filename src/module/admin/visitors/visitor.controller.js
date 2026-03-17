const visitorService = require("./visitor.service");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  return res.status(statusCode).json({ message });
}

async function createVisitor(req, res) {
  try {
    const visitor = await visitorService.createVisitor(req.body);
    return res.status(201).json({ message: "Visitor created", data: visitor });
  } catch (err) {
    return sendError(res, err);
  }
}

async function listVisitors(req, res) {
  try {
    const visitors = await visitorService.listVisitors({
      email: req.query?.email,
      invite_code: req.query?.invite_code
    });
    return res.status(200).json({ data: visitors });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getVisitor(req, res) {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    return res.status(200).json({ data: visitor });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getVisitorByInvite(req, res) {
  try {
    const visitor = await visitorService.getVisitorByInviteCode(req.params.invite_code);
    return res.status(200).json({ data: visitor });
  } catch (err) {
    return sendError(res, err);
  }
}

async function updateVisitor(req, res) {
  try {
    const visitor = await visitorService.updateVisitor(req.params.id, req.body);
    return res.status(200).json({ message: "Visitor updated", data: visitor });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteVisitor(req, res) {
  try {
    const visitor = await visitorService.deleteVisitor(req.params.id);
    return res.status(200).json({ message: "Visitor deleted", data: visitor });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  createVisitor,
  listVisitors,
  getVisitor,
  getVisitorByInvite,
  updateVisitor,
  deleteVisitor
};
