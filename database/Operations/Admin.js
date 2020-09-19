const { Admin } = require("../Models/Admin");
const ADMIN_TYPE = require("../../enum/AdminType");

const createAdmin = async (name, email, password) => {
  // need to hash password before storing once we figure out how to do the security
  const newAdmin = await Admin.create({
    name: name,
    email: email,
    password: password,
    adminType: ADMIN_TYPE.ADMIN,
  });
  return newAdmin;
};

const createSuperAdmin = async (id, name, email, password) => {
  // need to hash password before storing once we figure out how to do the security
  const newSuperAdmin = await Admin.create({
    adminId: id,
    name: name,
    email: email,
    password: password,
    adminType: ADMIN_TYPE.SUPER_ADMIN,
  });
  return newSuperAdmin;
};

const retrieveAdminById = async (adminId) => {
  const admin = await Admin.findOne({
    where: {
      adminId: adminId,
    },
  });
  return admin;
};

module.exports = {
  createAdmin,
  createSuperAdmin,
  retrieveAdminById,
};
