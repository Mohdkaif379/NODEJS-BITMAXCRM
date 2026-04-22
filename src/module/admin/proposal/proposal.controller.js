const {
  createProposalService,
  getAllProposalsService,
  getProposalByIdService,
  updateProposalService,
  deleteProposalService,
} = require("./proposal.service");
const { uploadMulterFile } = require("../../../core/config/cloudinary");

// CREATE
const createProposalController = async (req, res) => {
  try {
    const uploadedFile = await uploadMulterFile(req.file, {
      folder: "bitmax/proposals/files",
      resource_type: "auto",
    });

    const data = {
      ...req.body,
      file: uploadedFile,
    };

    const proposal = await createProposalService(data);

    return res.status(201).json({
      success: true,
      message: "Proposal created successfully",
      data: proposal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getAllProposalsController = async (req, res) => {
  try {
    const proposals = await getAllProposalsService();

    return res.status(200).json({
      success: true,
      data: proposals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getProposalByIdController = async (req, res) => {
  try {
    const proposal = await getProposalByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateProposalController = async (req, res) => {
  try {
    const uploadedFile = await uploadMulterFile(req.file, {
      folder: "bitmax/proposals/files",
      resource_type: "auto",
    });

    const proposal = await updateProposalService(
      req.params.id,
      {
        ...req.body,
        ...(uploadedFile ? { file: uploadedFile } : {}),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Proposal updated",
      data: proposal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteProposalController = async (req, res) => {
  try {
    await deleteProposalService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Proposal deleted",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProposalController,
  getAllProposalsController,
  getProposalByIdController,
  updateProposalController,
  deleteProposalController,
};
