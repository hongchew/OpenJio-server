const {Op} = require('sequelize');
const {User} = require('../Models/User');
const {Address} = require('../Models/Address');
const {Wallet} = require('../Models/Wallet');
const {Badge} = require('../Models/Badge');
const {RecurrentAgreement} = require('../Models/RecurrentAgreement');

const {sendEmail} = require('../../utils/mailer');
const badgeControl = require('../../enum/BadgeControl');
const {createWallet} = require('./Wallet');
const {
  populateBadgesOnUserCreation,
  retrieveBadgeByUserIdAndBadgeType,
} = require('./Badge');

/*
  Create and insert user into database
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

    return await Promise.all([
      createWallet(newUser.userId),
      populateBadgesOnUserCreation(newUser.userId),
    ])
      .then(async (res) => {
        sendEmail(email, {
          subject: 'New Account Creation at OpenJio',
          text: `
  <p>A new account had been created at OpenJio with this email address. </P>
  <p>If you had created an OpenJio account, please click <a href= "http://localhost:3000/users/verify-account-creation/${newUser.userId}">here</a> to verify the account.
  <p>If you had not, please ignore this email. </p>
        `,
        });

        return await retrieveUserByUserId(newUser.userId);
      })
      .catch((e) => {
        throw e;
      });
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
      include: [
        Address,
        Wallet,
        {model: Wallet, include: [RecurrentAgreement]},
        {model: Badge, order: [['name', 'DESC']], separate: true},
      ],
    });
    return user;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Increase user strike count
  Parameters: (userId: string)
  Return: Updated User object 
*/
const strikeUser = async (userId) => {
  try {
    const user = await retrieveUserByUserId(userId);
    user.incrementStrikeCount();

    if (user.strikeCount >= 3) {
      user.isBlackListed = true;
    }

    await user.save();
    return await retrieveUserByUserId(userId);
  } catch (e) {
    console.log(e);
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
      user.isPasswordReset = false; // set flag to false after every password change
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
  Reset user's password
  Parameters: (email: string)
  Return: Promise ( Model.User)
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
      user.isPasswordReset = true; //set flag to true for prompt to change password on login
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
  Return: User object
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

/*
  Retrieve All user
  Parameters: ()
  Return: [Model.User]
*/
const retrieveAllUsers = async () => {
  try {
    return await User.findAll({
      attributes: {
        exclude: ['salt', 'password'],
      },
      include: Address,
    });
  } catch (e) {
    throw e;
  }
};

/*
  Retrieve all users with COVID-19
  Parameters: ()
  Return: [Model.User]
*/
const retrieveAllUsersWithCovid = async () => {
  try {
    return await User.findAll({
      where: {
        hasCovid: true,
      },
      attributes: {
        exclude: ['salt', 'password'],
      },
      include: Address,
    });
  } catch (e) {
    throw e;
  }
};

/*
  Verify User Account Creation
  Parameters: (userId : string)
  Return: boolean
*/
const verifyUserAccountCreation = async (userId) => {
  try {
    const user = await retrieveUserByUserId(userId);
    if (!user) {
      return false;
    }

    user.isValidated = true;
    await user.save();
    return true;
  } catch (e) {
    throw e;
  }
};

/*
  Update counter on user and user-badge 
  Parameters: (userId: string, badgeType: string)
  Return: true
*/
const giveBadge = async (userId, badgeType) => {
  try {
    if (!badgeControl.types[badgeType]) {
      throw 'This badge does not exist';
    }
    console.log(retrieveUserByUserId);
    const user = await retrieveUserByUserId(userId);
    if (!user) {
      throw 'user does not exist';
    }
    const badge = await retrieveBadgeByUserIdAndBadgeType(userId, badgeType);

    user.incrementBadgeCount();
    badge.incrementBadgeCount();

    return await Promise.all([user.save(), badge.save()]).then(() => true);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Get leaderboard 
  Parameters: (type = "TOTAL" || "MONTHLY")
  Return: array of top 10 users with more than 0 badges sorted in first to last in terms of monthly/total badge count
*/
const retrieveLeaderboard = async (type) => {
  try {
    const leaderboard = await User.findAll({
      where:
        type === 'MONTHLY'
          ? {
              badgeCountMonthly: {
                [Op.gt]: 0,
              },
            }
          : {
              badgeCountTotal: {
                [Op.gt]: 0,
              },
            },
      order: [
        [type === 'MONTHLY' ? 'badgeCountMonthly' : 'badgeCountTotal', 'DESC'],
        ['lastBadgeReceived', 'ASC'],
      ],
      limit: 10,
      attributes: {
        exclude: [
          'salt',
          'password',
          'isBlackListed',
          'hasCovid',
          'strikeCount',
          'defaultAddressId',
        ],
      },
      include: [{model: Badge, order: [['name', 'DESC']], separate: true}],
    });
    return leaderboard;
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
  retrieveAllUsers,
  retrieveAllUsersWithCovid,
  retrieveUserByUserId,
  retrieveUserByEmail,
  verifyUserAccountCreation,
  giveBadge,
  retrieveLeaderboard,
  strikeUser,
};
