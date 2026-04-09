const adminService = require("./admin.service");
const mongoose = require("mongoose");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  if (err?.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }

  return res.status(statusCode).json({ message });
}

async function createAdmin(req, res) {
  try {
    const admin = await adminService.createAdmin(req.body);
    return res.status(201).json({ message: "Admin created", data: admin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function listAdmins(_req, res) {
  try {
    const admins = await adminService.listAdmins();
    return res.status(200).json({ data: admins });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getAdmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const admin = await adminService.getAdminById(id);
    return res.status(200).json({ data: admin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function updateAdmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const admin = await adminService.updateAdmin(id, req.body);
    return res.status(200).json({ message: "Admin updated", data: admin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteAdmin(req, res) {
  try {
    const id = req.params?.id || req.auth?.sub;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const admin = await adminService.deleteAdmin(id);
    return res.status(200).json({ message: "Admin deleted", data: admin });
  } catch (err) {
    return sendError(res, err);
  }
}

async function login(req, res) {
  try {
    const result = await adminService.loginAdmin(req.body?.email, req.body?.password);
    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      data: result.admin
    });
  } catch (err) {
    return sendError(res, err);
  }
}

async function changePassword(req, res) {
  try {
    const adminId = req.auth?.sub;
    const { new_password } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await adminService.changePassword(adminId, new_password);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  createAdmin,
  listAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  login,
  changePassword
};
