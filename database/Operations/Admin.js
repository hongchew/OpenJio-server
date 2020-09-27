const { Admin } = require('../Models/Admin');
const ADMIN_TYPE = require('../../enum/AdminType');
const { Sequelize } = require('sequelize');

/*
  Find and retrieve user from database with adminId
  Parameters: (adminId: UUID)
  Return: User object less password and salt (null if not found)
*/
const retrieveAdminByAdminId = async (adminId) => {
  try {
    const admin = await Admin.findOne({
      where: {
        adminId: adminId,
      },
      attributes: {
        exclude: ['salt', 'password'],
      },
    });
    return admin;
  } catch (e) {
    throw console.log(e);
  }
};

/*
  Retrieve admins by email from database
  Parameters: (email: string)
  Return: Admin object (null if not found)
*/
const retrieveAdminByEmail = async (email) => {
  try {
    const admin = await Admin.findOne({
      where: {
        email: email,
      },
    });
    return admin;
  } catch (e) {
    throw console.log(e);
  }
};

/*
  Create and insert admin into database
  Parameters: (email: string, password: string, name: string)
  Return: User object of new user (null if not found)
*/
const createAdmin = async (name, email, password) => {
  try {
    const newAdmin = Admin.build({
      name: name,
      email: email,
    });

    newAdmin.salt = Admin.generateSalt();
    newAdmin.password = Admin.encryptPassword(password, newAdmin.salt);

    await newAdmin.save();

    return await retrieveAdminByAdminId(newAdmin.adminId);
  } catch (e) {
    throw console.log(e);
  }
};

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

module.exports = {
  createAdmin,
  createSuperAdmin,
  retrieveAdminById,
};
