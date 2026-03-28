const Lead = require("./lead.model");

// CREATE
const createLeadService = async (data) => {
  const exists = await Lead.findOne({ email: data.email });
  if (exists) {
    throw new Error("Lead with this email already exists");
  }

  return await Lead.create(data);
};

// GET ALL (with filter)
const getAllLeadsService = async (adminId, query) => {
  const filter = { admin: adminId };

  // 🔥 status filter
  if (query.status) {
    filter.status = query.status;
  }

  return await Lead.find(filter).sort({ createdAt: -1 });
};

// GET SINGLE
const getLeadByIdService = async (id, adminId) => {
  const lead = await Lead.findOne({ _id: id, admin: adminId });
  if (!lead) throw new Error("Lead not found");
  return lead;
};

// UPDATE
const updateLeadService = async (id, adminId, data) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, admin: adminId },
    data,
    { new: true }
  );

  if (!lead) throw new Error("Lead not found");
  return lead;
};

// DELETE
const deleteLeadService = async (id, adminId) => {
  const lead = await Lead.findOneAndDelete({
    _id: id,
    admin: adminId,
  });

  if (!lead) throw new Error("Lead not found");
  return lead;
};

module.exports = {
  createLeadService,
  getAllLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
};