const { User } = require('../Models/User')

const createUser = async (name, email, password) => {
    const newUser = User.build({
        name: name, 
        email: email
    })

    newUser.salt = User.generateSalt();
    newUser.password = User.encryptPassword(password, newUser.salt);

    console.log(newUser);

    await newUser.save();

    return newUser
}

module.exports = {
    createUser
}