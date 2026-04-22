const Employee = require("../../admin/employee/employee.model");
const bcrypt = require("bcryptjs");

const updateProfile = async (employeeId, data) => {
  const updateData = {};

  if (data.emp_name) updateData.emp_name = data.emp_name;
  if (data.profile_photo) updateData.profile_photo = data.profile_photo;
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(data.password, salt);
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updateData, {
    new: true,
    select: "-password",
  });

  return updatedEmployee;
};

module.exports = { updateProfile };
