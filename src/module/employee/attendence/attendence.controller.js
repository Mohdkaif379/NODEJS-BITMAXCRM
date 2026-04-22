const { markInService, markOutService,startBreakService, endBreakService  } = require("./attendence.service");
const { uploadMulterFile } = require("../../../core/config/cloudinary");

// MARK IN Controller
const markInController = async (req, res) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id)
      return res.status(400).json({ success: false, message: "Employee ID is required" });

    const profile_image = await uploadMulterFile(req.file, {
      folder: "bitmax/attendence/mark_in",
      resource_type: "image",
    });

    const data = await markInService(employee_id, profile_image);

    res.status(200).json({ success: true, message: "Mark In successful", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MARK OUT Controller (requires image and status)
const markOutController = async (req, res) => {
  try {
    const { employee_id, status } = req.body;
    if (!employee_id)
      return res.status(400).json({ success: false, message: "Employee ID is required" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "Profile image is required to mark out" });

    if (!status || !["yes","no"].includes(status.toLowerCase()))
      return res.status(400).json({ success: false, message: "Status must be 'yes' or 'no'" });

    const profile_image = await uploadMulterFile(req.file, {
      folder: "bitmax/attendence/mark_out",
      resource_type: "image",
    });

    const data = await markOutService(employee_id, profile_image, status.toLowerCase());

    res.status(200).json({ success: true, message: "Mark Out successful and report submitted", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startBreakController = async (req, res) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id)
      return res.status(400).json({ success: false, message: "Employee ID is required" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "Profile image is required to start break" });

    const profile_image = await uploadMulterFile(req.file, {
      folder: "bitmax/attendence/break_start",
      resource_type: "image",
    });

    const data = await startBreakService(employee_id, profile_image);
    res.status(200).json({ success: true, message: "Break started successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// END BREAK
const endBreakController = async (req, res) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id)
      return res.status(400).json({ success: false, message: "Employee ID is required" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "Profile image is required to end break" });

    const profile_image = await uploadMulterFile(req.file, {
      folder: "bitmax/attendence/break_end",
      resource_type: "image",
    });

    const data = await endBreakService(employee_id, profile_image);
    res.status(200).json({ success: true, message: "Break ended successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  markInController,
  markOutController,
   startBreakController,
  endBreakController
};
