const {User} = require('../Models/User');

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
    });
    return user;
  } catch (e) {
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
    throw e;
  }
};

/*
  Verify login credentials
  Parameters: (email: string, password: string)
  Return: User object if successful login, 
*/
const verifyLogin = async (email, password) => {
  try {
    const user = await retrieveUserByEmail(email);
    if (!user || !user.isCorrectPassword(password)) {
      // no such email or wrong password
      return null;
    } else {
      // email exist and provided password is right
      return await retrieveUserByUserId(user.userId);
    }
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createUser,
  verifyLogin
};
