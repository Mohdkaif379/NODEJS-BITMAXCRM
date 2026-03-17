const bcrypt = require("bcrypt");
const Employee = require("./employee.model");
const EmployeeFamilyDetails = require("../employeefamily/employeefamily.model");
const EmployeeBankDetails = require("../employeebank/employeebank.model");
const EmployeePayroll = require("../employeepayroll/employeepyroll");
const EmployeeQualification = require("../employeequalification/employeequalification");
const EmployeeDocuments = require("../employeedocument/employeedocument.model");
const EmployeeExperience = require("../employeeexperience/employeeexperience.model");
const { uploadImage } = require("../../../core/config/cloudinary");

async function maybeUpload(value, folder, resourceType = "image") {
  if (!value) return null;
  return uploadImage(value, { folder, resource_type: resourceType });
}

function normalizeDate(value) {
  if (value === null || value === "" || value === undefined) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw Object.assign(new Error("Invalid date"), { statusCode: 400 });
  return d;
}

async function generateEmployeeCode(joiningDate) {
  const yearSuffix = joiningDate ? String(new Date(joiningDate).getFullYear()).slice(-2) : String(new Date().getFullYear()).slice(-2);
  const regex = new RegExp(`^BT\\/(\\d+)\\/${yearSuffix}$`);

  const codes = await Employee.find({ emp_code: { $regex: new RegExp(`^BT\\/\\d+\\/${yearSuffix}$`) } })
    .select("emp_code")
    .lean();

  let maxSeq = 1085;
  for (const row of codes) {
    const code = row?.emp_code;
    const m = typeof code === "string" ? code.match(regex) : null;
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  }

  return `BT/${maxSeq + 1}/${yearSuffix}`;
}

function pickArray(body, camel, snake) {
  if (Array.isArray(body?.[camel])) return body[camel];
  if (Array.isArray(body?.[snake])) return body[snake];
  return [];
}

function pickEmployeeFields(body) {
  return {
    emp_code: body?.emp_code ?? null,
    emp_name: body?.emp_name,
    emp_email: body?.emp_email,
    emp_phone: body?.emp_phone,
    joining_date: body?.joining_date ?? null,
    dob: body?.dob ?? null,
    position: body?.position ?? null,
    department: body?.department ?? null,
    status: body?.status ?? 1,
    profile_photo: body?.profile_photo ?? body?.profile_image ?? null,
    password: body?.password
  };
}

async function createEmployee(body) {
  const data = pickEmployeeFields(body);
  if (!data.emp_name) throw Object.assign(new Error("emp_name is required"), { statusCode: 400 });
  if (!data.emp_email) throw Object.assign(new Error("emp_email is required"), { statusCode: 400 });
  if (!data.emp_phone) throw Object.assign(new Error("emp_phone is required"), { statusCode: 400 });
  if (!data.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });

  const joiningDate = normalizeDate(data.joining_date);
  const empCode = data.emp_code ? String(data.emp_code).trim() : await generateEmployeeCode(joiningDate);

  const employee = await Employee.create({
    emp_code: empCode,
    emp_name: String(data.emp_name).trim(),
    emp_email: String(data.emp_email).toLowerCase().trim(),
    emp_phone: String(data.emp_phone).trim(),
    joining_date: joiningDate,
    dob: normalizeDate(data.dob),
    position: data.position,
    department: data.department,
    status: data.status,
    role: "employee",
    profile_photo: data.profile_photo ? await maybeUpload(data.profile_photo, "bitmax/employees/profile") : null,
    password: await bcrypt.hash(String(data.password), 10)
  });

  const employeeId = employee._id;

  // Related models (arrays)
  const familyDetails = pickArray(body, "familyDetails", "family_details");
  const bankDetails = pickArray(body, "bankDetails", "bank_details");
  const payrolls = pickArray(body, "payrolls", "payrolls");
  const qualifications = pickArray(body, "qualifications", "qualifications");
  const documents = pickArray(body, "documents", "documents");
  const experiences = pickArray(body, "experiences", "experiences");

  if (familyDetails.length) {
    const rows = [];
    for (const f of familyDetails) {
      rows.push({
        employee_id: employeeId,
        name: f?.name,
        relationship: f?.relationship,
        contact: f?.contact ?? null,
        aadhar_number: f?.aadhar_number ?? null,
        aadhar_profile: f?.aadhar_profile
          ? await maybeUpload(f.aadhar_profile, "bitmax/employees/family/aadhar", "auto")
          : null,
        pan_number: f?.pan_number ?? null,
        pan_profile: f?.pan_profile ? await maybeUpload(f.pan_profile, "bitmax/employees/family/pan", "auto") : null
      });
    }
    await EmployeeFamilyDetails.insertMany(rows);
  }

  if (bankDetails.length) {
    await EmployeeBankDetails.insertMany(
      bankDetails.map((b) => ({
        employee_id: employeeId,
        bank_name: b?.bank_name,
        account_number: b?.account_number,
        ifsc_code: b?.ifsc_code,
        branch_name: b?.branch_name ?? null
      }))
    );
  }

  if (payrolls.length) {
    await EmployeePayroll.insertMany(
      payrolls.map((p) => ({
        employee_id: employeeId,
        basic_salary: p?.basic_salary ?? 0,
        hra: p?.hra ?? 0,
        conveyance_allowance: p?.conveyance_allowance ?? 0,
        medical_allowance: p?.medical_allowance ?? 0
      }))
    );
  }

  if (qualifications.length) {
    await EmployeeQualification.insertMany(
      qualifications.map((q) => ({
        employee_id: employeeId,
        degree: q?.degree,
        institution: q?.institution,
        passing_year: q?.passing_year ?? null,
        grade: q?.grade ?? null
      }))
    );
  }

  if (documents.length) {
    const rows = [];
    for (const d of documents) {
      rows.push({
        employee_id: employeeId,
        document_type: d?.document_type,
        file: d?.file ? await maybeUpload(d.file, "bitmax/employees/documents", "auto") : d?.file
      });
    }
    await EmployeeDocuments.insertMany(rows);
  }

  if (experiences.length) {
    await EmployeeExperience.insertMany(
      experiences.map((e) => ({
        employee_id: employeeId,
        company_name: e?.company_name,
        position: e?.position,
        start_date: normalizeDate(e?.start_date),
        end_date: normalizeDate(e?.end_date)
      }))
    );
  }

  return getEmployeeById(employeeId);
}

async function listEmployees() {
  const familyFrom = EmployeeFamilyDetails.collection.name;
  const bankFrom = EmployeeBankDetails.collection.name;
  const payrollFrom = EmployeePayroll.collection.name;
  const qualificationFrom = EmployeeQualification.collection.name;
  const documentFrom = EmployeeDocuments.collection.name;
  const experienceFrom = EmployeeExperience.collection.name;

  return Employee.aggregate([
    { $sort: { created_at: -1 } },
    { $project: { password: 0 } },
    { $set: { employee: "$$ROOT" } },
    { $project: { employee: 1 } },
    {
      $lookup: {
        from: familyFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "familyDetails"
      }
    },
    {
      $lookup: {
        from: bankFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "bankDetails"
      }
    },
    {
      $lookup: {
        from: payrollFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "payrolls"
      }
    },
    {
      $lookup: {
        from: qualificationFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "qualifications"
      }
    },
    {
      $lookup: {
        from: documentFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "documents"
      }
    },
    {
      $lookup: {
        from: experienceFrom,
        let: { employeeId: "$employee._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$employee_id", "$$employeeId"] } } },
          { $sort: { created_at: -1 } }
        ],
        as: "experiences"
      }
    }
  ]);
}

async function getEmployeeById(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw Object.assign(new Error("Employee not found"), { statusCode: 404 });

  const [familyDetails, bankDetails, payrolls, qualifications, documents, experiences] = await Promise.all([
    EmployeeFamilyDetails.find({ employee_id: id }).sort({ created_at: -1 }),
    EmployeeBankDetails.find({ employee_id: id }).sort({ created_at: -1 }),
    EmployeePayroll.find({ employee_id: id }).sort({ created_at: -1 }),
    EmployeeQualification.find({ employee_id: id }).sort({ created_at: -1 }),
    EmployeeDocuments.find({ employee_id: id }).sort({ created_at: -1 }),
    EmployeeExperience.find({ employee_id: id }).sort({ created_at: -1 })
  ]);

  return { employee, familyDetails, bankDetails, payrolls, qualifications, documents, experiences };
}

async function updateEmployee(id, body) {
  const update = {};
  const allowed = ["emp_code", "emp_name", "emp_email", "emp_phone", "joining_date", "dob", "position", "department", "status", "profile_photo", "password"];
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body || {}, key)) continue;
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }

  if ("emp_email" in update) update.emp_email = String(update.emp_email).toLowerCase().trim();
  if ("joining_date" in update) update.joining_date = normalizeDate(update.joining_date);
  if ("dob" in update) update.dob = normalizeDate(update.dob);
  if ("profile_photo" in update) {
    update.profile_photo = update.profile_photo ? await maybeUpload(update.profile_photo, "bitmax/employees/profile") : null;
  }
  if ("password" in update) {
    if (!update.password) throw Object.assign(new Error("password is required"), { statusCode: 400 });
    update.password = await bcrypt.hash(String(update.password), 10);
  }

  const employee = await Employee.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
  if (!employee) throw Object.assign(new Error("Employee not found"), { statusCode: 404 });

  // Replace related arrays if provided
  if (Object.prototype.hasOwnProperty.call(body || {}, "familyDetails")) {
    await EmployeeFamilyDetails.deleteMany({ employee_id: id });
    const familyDetails = Array.isArray(body.familyDetails) ? body.familyDetails : [];
    if (familyDetails.length) {
      const rows = [];
      for (const f of familyDetails) {
        rows.push({
          employee_id: id,
          name: f?.name,
          relationship: f?.relationship,
          contact: f?.contact ?? null,
          aadhar_number: f?.aadhar_number ?? null,
          aadhar_profile: f?.aadhar_profile ? await maybeUpload(f.aadhar_profile, "bitmax/employees/family/aadhar", "auto") : null,
          pan_number: f?.pan_number ?? null,
          pan_profile: f?.pan_profile ? await maybeUpload(f.pan_profile, "bitmax/employees/family/pan", "auto") : null
        });
      }
      await EmployeeFamilyDetails.insertMany(rows);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "bankDetails")) {
    await EmployeeBankDetails.deleteMany({ employee_id: id });
    const bankDetails = Array.isArray(body.bankDetails) ? body.bankDetails : [];
    if (bankDetails.length) {
      await EmployeeBankDetails.insertMany(
        bankDetails.map((b) => ({
          employee_id: id,
          bank_name: b?.bank_name,
          account_number: b?.account_number,
          ifsc_code: b?.ifsc_code,
          branch_name: b?.branch_name ?? null
        }))
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "payrolls")) {
    await EmployeePayroll.deleteMany({ employee_id: id });
    const payrolls = Array.isArray(body.payrolls) ? body.payrolls : [];
    if (payrolls.length) {
      await EmployeePayroll.insertMany(
        payrolls.map((p) => ({
          employee_id: id,
          basic_salary: p?.basic_salary ?? 0,
          hra: p?.hra ?? 0,
          conveyance_allowance: p?.conveyance_allowance ?? 0,
          medical_allowance: p?.medical_allowance ?? 0
        }))
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "qualifications")) {
    await EmployeeQualification.deleteMany({ employee_id: id });
    const qualifications = Array.isArray(body.qualifications) ? body.qualifications : [];
    if (qualifications.length) {
      await EmployeeQualification.insertMany(
        qualifications.map((q) => ({
          employee_id: id,
          degree: q?.degree,
          institution: q?.institution,
          passing_year: q?.passing_year ?? null,
          grade: q?.grade ?? null
        }))
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "documents")) {
    await EmployeeDocuments.deleteMany({ employee_id: id });
    const documents = Array.isArray(body.documents) ? body.documents : [];
    if (documents.length) {
      const rows = [];
      for (const d of documents) {
        rows.push({
          employee_id: id,
          document_type: d?.document_type,
          file: d?.file ? await maybeUpload(d.file, "bitmax/employees/documents", "auto") : d?.file
        });
      }
      await EmployeeDocuments.insertMany(rows);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "experiences")) {
    await EmployeeExperience.deleteMany({ employee_id: id });
    const experiences = Array.isArray(body.experiences) ? body.experiences : [];
    if (experiences.length) {
      await EmployeeExperience.insertMany(
        experiences.map((e) => ({
          employee_id: id,
          company_name: e?.company_name,
          position: e?.position,
          start_date: normalizeDate(e?.start_date),
          end_date: normalizeDate(e?.end_date)
        }))
      );
    }
  }

  return getEmployeeById(id);
}

async function deleteEmployee(id) {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) throw Object.assign(new Error("Employee not found"), { statusCode: 404 });

  await Promise.all([
    EmployeeFamilyDetails.deleteMany({ employee_id: id }),
    EmployeeBankDetails.deleteMany({ employee_id: id }),
    EmployeePayroll.deleteMany({ employee_id: id }),
    EmployeeQualification.deleteMany({ employee_id: id }),
    EmployeeDocuments.deleteMany({ employee_id: id }),
    EmployeeExperience.deleteMany({ employee_id: id })
  ]);

  return employee;
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};
