const {User} = require('../Models/User');
const {Address} = require('../Models/Address')
const nodemailer = require('nodemailer');

/*
  Create an insert user into database
  Parameters: (email: string, password: string, name: string)
  Return: User object of new user (null if not found)
*/
const createUser = async (email, password, name) => {
  try {
    const newUser = User.build({
      name: name,
      email: email,
    });

    newUser.salt = User.generateSalt();
    newUser.password = User.encryptPassword(password, newUser.salt);

    await newUser.save();

    return await retrieveUserByUserId(newUser.userId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Find and retrieve user from database with userId
  Parameters: (userId: string)
  Return: User object less password and salt (null if not found)
*/
const retrieveUserByUserId = async (userId) => {
  try {
    const user = await User.findOne({
      where: {
        userId: userId,
      },
      attributes: {
        exclude: ['salt', 'password'],
      },
      include: Address
    });
    return user;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Find and retrieve user from database with userId
  Parameters: (email: string)
  Return: User object (null if not found)
*/
const retrieveUserByEmail = async (email) => {
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    return user;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Verify user login credentials
  Parameters: (email: string, password: string)
  Return: User object if successful login, 
*/
const verifyUserLogin = async (email, password) => {
  try {
    const user = await retrieveUserByEmail(email);
    if (!user || !user.isCorrectPassword(password)) {
      // no such email or wrong password
      return null;
    } else {
      // email exist and provided password is right
      return retrieveUserByUserId(user.userId);
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Update user's password
  Parameters: (email: string, currPassword: string, newPassword: string)
  Return: User object if password updated successfully, 
*/
const changeUserPassword = async (email, currPassword, newPassword) => {
  try {
    const user = await retrieveUserByEmail(email);

    //if email is wrong
    if (!user) {
      throw 'Server Error';
    }
    //check current password against password in the database
    else if (user.isCorrectPassword(currPassword)) {
      user.password = User.encryptPassword(newPassword, user.salt);
      return user.save();
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Send email to user
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
  Reset user's password
  Parameters: (email: string)
  Return: Promise
*/
const resetUserPassword = async (email) => {
  try {
    const user = await retrieveUserByEmail(email);

    //if email is wrong
    if (!user) {
      throw 'Server Error';
    } else {
      const newPassword = User.generatePassword();
      const content = {
        subject: 'Reset Password',
        text: `Your new password is: ${newPassword}`,
      };

      user.password = User.encryptPassword(newPassword, user.salt);
      user.save();
      return sendEmail(email, content);
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Reset user's password
  Parameters: (email: string)
  Return: Promise
*/
const verifyUserSingPass = async (userId) => {
  try {
    const user = await retrieveUserByUserId(userId);
    if (!user) {
      // user not found
      throw 'User not found';
    }
    user.isSingPassVerified = true;
    await user.save();
    return await retrieveUserByUserId(userId);
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
    mobileNumber: string,
    email: string,
    isBlackListed: boolean,
    hasCovid: boolean,
    isSingPassVerified": boolean,
    strikeCount: number,
    defaultAddressId: string
  })
*/
const updateUserDetails = async (user) => {
  try {
    const userToUpdate = await retrieveUserByUserId(user.userId);
    if (!userToUpdate) {
      throw 'User not found';
    }
    const updatedUser = await userToUpdate.update(user);
    return await retrieveUserByUserId(updatedUser.userId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createUser,
  verifyUserLogin,
  changeUserPassword,
  sendEmail,
  resetUserPassword,
  verifyUserSingPass,
  updateUserDetails,
};
