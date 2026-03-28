const profileService = require("./profileService");

const updateProfile = async (req, res) => {
  try {
    const employeeId = req.employee._id; // token se id le li
    const { emp_name, password } = req.body;
    const profile_photo = req.file ? req.file.path : null;

    const updatedProfile = await profileService.updateProfile(employeeId, {
      emp_name,
      password,
      profile_photo,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProfile };