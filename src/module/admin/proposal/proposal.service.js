const Proposal = require("./proposal.model");

// CREATE
const createProposalService = async (data) => {
  return await Proposal.create(data);
};

// GET ALL
const getAllProposalsService = async () => {
  return await Proposal.find()
    .populate("lead_id")
    .sort({ createdAt: -1 });
};

// GET SINGLE
const getProposalByIdService = async (id) => {
  const proposal = await Proposal.findById(id).populate("lead_id");

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  return proposal;
};

// UPDATE
const updateProposalService = async (id, data) => {
  const proposal = await Proposal.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!proposal) throw new Error("Proposal not found");

  return proposal;
};

// DELETE
const deleteProposalService = async (id) => {
  const proposal = await Proposal.findByIdAndDelete(id);

  if (!proposal) throw new Error("Proposal not found");

  return proposal;
};

module.exports = {
  createProposalService,
  getAllProposalsService,
  getProposalByIdService,
  updateProposalService,
  deleteProposalService,
};