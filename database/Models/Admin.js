const { Sequelize, Model, DataTypes } = require('sequelize');
const crypto = require('crypto');

class Admin extends Model {
  static generateSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  static encryptPassword(plainText, salt) {
    return crypto.createHash('RSA-SHA256').update(plainText).update(salt).digest('hex');
  }

  //return true if password entered is correct
  isCorrectPassword(enteredPassword) {
    return Admin.encryptPassword(enteredPassword, this.salt) === this.password;
  }
}

const initAdmin = async (sequelize) => {
  Admin.init(
    {
      adminId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('password');
        },
      },
      salt: {
        type: Sequelize.STRING,
        get() {
          return this.getDataValue('salt');
        },
      },
      adminType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Admin',
    }
  );
  console.log(`****[database] Admin initialized`);
};

module.exports = { Admin, initAdmin };