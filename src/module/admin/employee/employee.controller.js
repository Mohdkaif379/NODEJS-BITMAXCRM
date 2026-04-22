const employeeService = require("./employee.service");
const { uploadMulterFile } = require("../../../core/config/cloudinary");

function sendError(res, err) {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  if (err?.code === 11000) return res.status(409).json({ message: "Duplicate key" });
  return res.status(statusCode).json({ message });
}

function tokenizeFieldName(key) {
  const tokens = String(key).match(/([^[\]]+)/g);
  return tokens || [String(key)];
}

function isIndexToken(token) {
  return /^[0-9]+$/.test(String(token));
}

function assignNestedValue(obj, tokens, value) {
  let cur = obj;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const last = i === tokens.length - 1;
    const nextToken = tokens[i + 1];

    if (last) {
      if (Array.isArray(cur) && isIndexToken(token)) cur[Number(token)] = value;
      else cur[token] = value;
      return;
    }

    const shouldBeArray = isIndexToken(nextToken);
    if (Array.isArray(cur)) {
      const idx = isIndexToken(token) ? Number(token) : null;
      if (idx === null) return;
      if (cur[idx] === undefined) cur[idx] = shouldBeArray ? [] : {};
      cur = cur[idx];
    } else {
      if (cur[token] === undefined) cur[token] = shouldBeArray ? [] : {};
      cur = cur[token];
    }
  }
}

function getUploadOptions(fieldname) {
  const key = String(fieldname || "");
  if (key === "profile_photo" || key === "profile_image") {
    return { folder: "bitmax/employees/profile", resource_type: "image" };
  }
  if (key.includes("aadhar_profile")) {
    return { folder: "bitmax/employees/family/aadhar", resource_type: "auto" };
  }
  if (key.includes("pan_profile")) {
    return { folder: "bitmax/employees/family/pan", resource_type: "auto" };
  }
  if (key.includes("[file]") || key === "file" || key.includes("documents")) {
    return { folder: "bitmax/employees/documents", resource_type: "auto" };
  }
  return { folder: "bitmax/employees/misc", resource_type: "auto" };
}

async function attachEmployeeUploads(body, files) {
  const nextBody = { ...body };
  const uploadList = Array.isArray(files) ? files : [];

  for (const file of uploadList) {
    if (!file?.fieldname) continue;
    const uploadUrl = await uploadMulterFile(file, getUploadOptions(file.fieldname));
    const tokens = tokenizeFieldName(file.fieldname);
    if (tokens.length === 1) {
      nextBody[file.fieldname] = uploadUrl;
      continue;
    }
    assignNestedValue(nextBody, tokens, uploadUrl);
  }

  return nextBody;
}

async function createEmployee(req, res) {
  try {
    const body = await attachEmployeeUploads(req.body, req.files);
    const result = await employeeService.createEmployee(body);
    return res.status(201).json({ message: "Employee created", data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function listEmployees(_req, res) {
  try {
    const employees = await employeeService.listEmployees();
    return res.status(200).json({ data: employees });
  } catch (err) {
    return sendError(res, err);
  }
}

async function getEmployee(req, res) {
  try {
    const result = await employeeService.getEmployeeById(req.params.id);
    return res.status(200).json({ data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function updateEmployee(req, res) {
  try {
    const body = await attachEmployeeUploads(req.body, req.files);
    const result = await employeeService.updateEmployee(req.params.id, body);
    return res.status(200).json({ message: "Employee updated", data: result });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteEmployee(req, res) {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    return res.status(200).json({ message: "Employee deleted", data: employee });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
};
