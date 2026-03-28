const {
  createLeadService,
  getAllLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
} = require("./lead.service");

// CREATE
const createLeadController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const data = {
      ...req.body,
      admin: adminId,
    };

    const lead = await createLeadService(data);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL (🔥 with status filter)
const getAllLeadsController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const leads = await getAllLeadsService(adminId, req.query);

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getLeadByIdController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const lead = await getLeadByIdService(req.params.id, adminId);

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateLeadController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const lead = await updateLeadService(
      req.params.id,
      adminId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Lead updated",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteLeadController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    await deleteLeadService(req.params.id, adminId);

    return res.status(200).json({
      success: true,
      message: "Lead deleted",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLeadController,
  getAllLeadsController,
  getLeadByIdController,
  updateLeadController,
  deleteLeadController,
};