const subadminService = require("./subadmin.service");
const mongoose = require("mongoose");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  if (err?.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }

  return res.status(statusCode).json({ message });
}

async function createSubadmin(req, res) {
  try {
    const subadmin = await subadminService.createSubadmin(req.body);
    return res.status(201).json({ message: "Subadmin created", data: subadmin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function listSubadmins(_req, res) {
  try {
    const subadmins = await subadminService.listSubadmins();
    return res.status(200).json({ data: subadmins });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getSubadmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const subadmin = await subadminService.getSubadminById(id);
    return res.status(200).json({ data: subadmin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function updateSubadmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const subadmin = await subadminService.updateSubadmin(id, req.body);
    return res.status(200).json({ message: "Subadmin updated", data: subadmin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteSubadmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const subadmin = await subadminService.deleteSubadmin(id);
    return res.status(200).json({ message: "Subadmin deleted", data: subadmin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function login(req, res) {
  try {
    const result = await subadminService.loginSubadmin(req.body?.email, req.body?.password);
    return res.status(200).json({ message: "Login successful", token: result.token, data: result.subadmin });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  createSubadmin,
  listSubadmins,
  getSubadmin,
  updateSubadmin,
  deleteSubadmin,
  login
};
