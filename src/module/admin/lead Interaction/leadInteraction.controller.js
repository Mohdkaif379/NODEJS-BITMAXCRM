const {
  createInteractionService,
  getAllInteractionsService,
  getInteractionByIdService,
  updateInteractionService,
  deleteInteractionService,
} = require("./leadInteraction.service");

// CREATE
const createInteractionController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const data = {
      ...req.body,
      created_by: adminId, // 🔥 injected from token
    };

    const interaction = await createInteractionService(data);

    return res.status(201).json({
      success: true,
      message: "Interaction created successfully",
      data: interaction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getAllInteractionsController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const interactions = await getAllInteractionsService(adminId);

    return res.status(200).json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getInteractionByIdController = async (req, res) => {
  try {
    const adminId = req.auth?.id || req.auth?._id || req.auth?.sub;

    const interaction = await getInteractionByIdService(
      req.params.id,
      adminId
    );

    return res.status(200).json({
      success: true,
      data: interaction,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateInteractionController = async (req, res) => {
  try {
    const interaction = await updateInteractionService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Interaction updated",
      data: interaction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteInteractionController = async (req, res) => {
  try {
    await deleteInteractionService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Interaction deleted",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createInteractionController,
  getAllInteractionsController,
  getInteractionByIdController,
  updateInteractionController,
  deleteInteractionController,
};