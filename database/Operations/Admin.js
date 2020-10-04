const {Admin} = require('../Models/Admin');
const ADMIN_TYPE = require('../../enum/AdminType');
const {Sequelize} = require('sequelize');
const nodemailer = require('nodemailer');

/*
  Create new admin inside database
  Parameters: (name: string,
    email: string,
    password: string,
    adminType: string)
  Return: Admin object if create is successful
*/
const createAdmin = async (name, email, password, adminType) => {
  try {
    const newAdmin = Admin.build({
      name: name,
      email: email,
      adminType: adminType,
    });

    newAdmin.salt = Admin.generateSalt();
    newAdmin.password = Admin.encryptPassword(password, newAdmin.salt);

    await newAdmin.save();

    return await retrieveAdminByAdminId(newAdmin.adminId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Find and retrieve admin from database with adminId
  Parameters: (adminId: string)
  Return: Admin object less password and salt (null if not found)
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
  Verify admin login credentials
  Parameters: (email: string, password: string)
  Return: Admin object if successful login, 
*/
const verifyAdminLogin = async (email, password) => {
  try {
    const admin = await retrieveAdminByEmail(email);
    if (!admin || !admin.isCorrectPassword(password)) {
      // no such email or wrong password
      return null;
    } else {
      // email exist and provided password is right
      return admin;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Update admin's password
  Parameters: (email: string, currPassword: string, newPassword: string)
  Return: Admin object if password updated successfully, 
*/
const changeAdminPassword = async (email, currPassword, newPassword) => {
  try {
    const admin = await retrieveAdminByEmail(email);

    if (!admin.isCorrectPassword(currPassword)) {
      throw 'Passwords do not match';
    }
    //if email is wrong
    else if (!admin) {
      throw 'Admin with ' + email + ' not found';
    }
    //check current password against password in the database
    else if (admin.isCorrectPassword(currPassword)) {
      admin.password = Admin.encryptPassword(newPassword, admin.salt);
      return admin.save();
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Send email to admin
  Parameters: (email: string, content: JSON)
  Return: Promise 
*/
const sendEmail = async (email, content) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'openjio4103@gmail.com',
      pass: '4103openjio',
    },
  });

  var mailOptions = {
    from: 'openjio4103@gmail.com',
    to: email,
    subject: content.subject,
    text: content.text,
  };

  return transporter.sendMail(mailOptions);
};

/*
  Reset admin's password
  Parameters: (email: string)
  Return: Promise
*/
const resetAdminPassword = async (email) => {
  try {
    const admin = await retrieveAdminByEmail(email);
    //if email is wrong
    if (!admin) {
      throw 'Admin ' + email + ' does not exist';
    } else {
      const newPassword = Admin.generatePassword();
      const content = {
        subject: 'Reset Password',
        text: `Your new password is: ${newPassword}`,
      };

      admin.password = Admin.encryptPassword(newPassword, admin.salt);
      admin.save();
      return sendEmail(email, content);
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create Super Admin
  Parameters: (name: string,
    email: string,
    password: string,
    adminType: string)
  Return: Admin object if create is successful
*/
const createSuperAdmin = async (id, name, email, password) => {
  return createAdminGeneric(
    name, 
    email, 
    password, 
    ADMIN_TYPE.SUPER_ADMIN, id
    );
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


/* ----------------------------------------
  Retrieve all admin accounts from database
  Parameters: (null)
  Return: Array of Admin objects
---------------------------------------- */
const retrieveAllAdminAccounts = async () => {
  try {
    const adminAccounts = await Admin.findAll({});
    return adminAccounts;
  } catch (e) {
    throw console.error(e);
  }
};

/* ----------------------------------------
  Delete Admin Account 
  Parameters: (adminId: UUID)
  Return: null
----------------------------------------*/
const deleteAdminAccount = async (adminId) => {
  try {
    
    const admin = await retrieveAdminByAdminId(adminId);

    if(!admin){
      throw 'Admin with ' + adminId + ' does not exist';
    }
    
    const adminDeleted = await admin.destroy();

    if (adminDeleted) {
      console.log('Admin account deleted!');
      return null;
    }

  } catch (e) {
    throw console.error(e);
  }
};

/*
  Update Admin Details
  Parameters: (admin: object {
    adminId: string,
    name: string,
    email: string,
    adminType: string
  })
  Return: Model.Admin object
*/
  const updateAdmin = async (admin) => {
  try {
    const adminToUpdate = await retrieveAdminByAdminId(admin.adminId);
    if (!adminToUpdate) {
      throw 'Admin ' + admin.adminId + ' not found';
    }
    const updatedAdmin = await adminToUpdate.update(admin);
    return await retrieveAdminByAdminId(updatedAdmin.adminId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createAdmin,
  createSuperAdmin,
  retrieveAdminByAdminId,
  retrieveAdminByEmail,
  retrieveAllAdminAccounts,
  deleteAdminAccount,
  verifyAdminLogin,
  changeAdminPassword,
  sendEmail,
  resetAdminPassword,
  updateAdmin,
};
