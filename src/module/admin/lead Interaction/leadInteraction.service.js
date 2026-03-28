const LeadInteraction = require("./leadInteraction.model");

// CREATE
const createInteractionService = async (data) => {
  return await LeadInteraction.create(data);
};

// GET ALL
const getAllInteractionsService = async (adminId) => {
  return await LeadInteraction.find({ created_by: adminId }) // 🔥 filter added
    .populate("lead_id")
    .populate("created_by", "name email") // optional
    .sort({ createdAt: -1 });
};

// GET SINGLE
const getInteractionByIdService = async (id, adminId) => {
  const interaction = await LeadInteraction.findOne({
    _id: id,
    created_by: adminId, // 🔥 security filter
  }).populate("lead_id");

  if (!interaction) {
    throw new Error("Interaction not found");
  }

  return interaction;
};

// UPDATE
const updateInteractionService = async (id, data) => {
  const interaction = await LeadInteraction.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!interaction) throw new Error("Interaction not found");

  return interaction;
};

// DELETE
const deleteInteractionService = async (id) => {
  const interaction = await LeadInteraction.findByIdAndDelete(id);

  if (!interaction) throw new Error("Interaction not found");

  return interaction;
};

module.exports = {
  createInteractionService,
  getAllInteractionsService,
  getInteractionByIdService,
  updateInteractionService,
  deleteInteractionService,
};