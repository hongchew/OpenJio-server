const {Admin} = require('../Models/Admin');
const ADMIN_TYPE = require('../../enum/AdminType');
const {Sequelize} = require('sequelize');
const {nodemailer} = require('nodemailer');

/*
  Find and retrieve user from database with adminId
  Parameters: (adminId: UUID)
  Return: User object less password and salt (null if not found)
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

    return await retrieveAdminByAdminId(newAdmin.userId);
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

    if (currPassword != newPassword) {
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
  Update User Details
  Parameters: (user: object {
    userId: string,
    name: string,
    email: string,
    adminType, string
  })
*/
const updateAdmin = async (admin) => {
  try {
    const adminToUpdate = await retrieveAdminByAdminId(admin.adminId);
    if (!adminToUpdate) {
      throw 'Admin ' + admin.adminId + ' not found';
    }
    const updatedAdmin = await adminToUpdate.update(admin);
    return await retrieveUserByUserId(updatedAdmin.adminId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createAdmin,
  retrieveAdminByAdminId,
  retrieveAdminByEmail,
  verifyAdminLogin,
  changeAdminPassword,
  sendEmail,
  resetAdminPassword,
  updateAdmin,
};
