const {User} = require('../Models/User');

/*
  Create an insert user into database
  Return: User object of new user
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
  Return: User object less password and salt
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

module.exports = {
  createUser,
};
