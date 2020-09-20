const { Admin } = require('../Models/Admin');
const ADMIN_TYPE = require('../../enum/AdminType');
const { Sequelize } = require('sequelize');

const createAdmin = async (name, email, password) => {
  return createAdminGeneric(id, name, email, password, ADMIN_TYPE.ADMIN);
};

const createSuperAdmin = async (id, name, email, password) => {
  return createAdminGeneric(name, email, password, ADMIN_TYPE.SUPER_ADMIN, id);
};

const createAdminGeneric = async (name, email, password, type, adminId) => {
  const newAdmin = Admin.build({
    adminId: adminId ? adminId : Sequelize.UUIDV4,
    name: name,
    email: email,
    password: password,
    adminType: type,
  });
  newAdmin.salt = Admin.generateSalt();
  newAdmin.password = Admin.encryptPassword(password, newAdmin.salt);

  console.log(newAdmin);

  await newAdmin.save();

  return newAdmin;
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
