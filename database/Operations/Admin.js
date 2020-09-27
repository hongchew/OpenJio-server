const { Admin } = require('../Models/Admin');
const ADMIN_TYPE = require('../../enum/AdminType');
const { Sequelize } = require('sequelize');
const { nodemailer } = require('nodemailer');

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
    throw console.error(e);
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
    throw console.error(e);
  }
};

/*
  Verify login credentials
  Parameters: (email: string, password: string)
  Return: Admin object if successful login, 
*/
const adminLogin = async (email, password) => {
  try {
    const admin = await retrieveAdminByEmail(email);
    if (!admin || !admin.isCorrectPassword(password)) {
      // no such email or wrong password
      return null;
    } else {
      // email exist and password is correct
      return await retrieveAdminByAdminId(Admin.adminId);
    }
  } catch (e) {
    throw console.error(e);
  }
};

/*
  Create and insert admin into database
  Parameters: (email: string, password: string, name: string)
  Return: User object of new user (null if not found)
*/
const createAdmin = async (username, name, email, password, adminType) => {
  try {
    const newAdmin = Admin.build({
      name: name,
      email: email,
      username: username,
    });

    newAdmin.salt = Admin.generateSalt();
    newAdmin.password = Admin.encryptPassword(password, newAdmin.salt);
    if (adminType === ADMIN_TYPE.SUPER_ADMIN) {
      newAdmin.adminType = ADMIN_TYPE.SUPER_ADMIN;
    } else {
      newAdmin.adminType = ADMIN_TYPE.ADMIN;
    }

    await newAdmin.save();

    return await retrieveAdminByAdminId(newAdmin.adminId);
  } catch (e) {
    throw console.error(e);
  }
};

/*
  Change password
  Parameters: (Admin: object, newPassword: string)
  Return: Admin object of existing user with new password (null if not found)
*/
const adminChangePassword = async (email, oldPassword, newPassword) => {
  try {
    const admin = await retrieveAdminByEmail(email);
    //check if old and new password is the same
    if (admin.isCorrectPassword(newPassword)) {
      throw 'Password is the same';
    } else {
      admin.password = Admin.encryptPassword(newPassword, admin.salt);
      await Admin.save();
      return await retrieveAdminByAdminId(admin.adminId);
    }
  } catch (e) {
    throw console.error(e);
  }
};

/*
  Function to initialise a super admin on running the server
  Return: An admin object of super admin with id = 1
*/
const createSuperAdmin = async (id, name, email, password) => {
  return createAdminGeneric(name, email, password, ADMIN_TYPE.SUPER_ADMIN, id);
};

/*
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
*/

module.exports = {
  createAdmin,
  createSuperAdmin,
  retrieveAdminByAdminId,
  retrieveAdminByEmail,
  adminLogin,
  adminChangePassword
};
