const {Sequelize, Model, DataTypes} = require('sequelize');
const crypto = require('crypto');

class User extends Model {
  static generateSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  static encryptPassword(plainText, salt) {
    return crypto
      .createHash('RSA-SHA256')
      .update(plainText)
      .update(salt)
      .digest('hex');
  }

  //return true if password entered is correct
  isCorrectPassword(enteredPassword) {
    return User.encryptPassword(enteredPassword, this.salt) === this.password;
  }

  incrementBadgeCount() {
    this.badgeCountMonthly += 1;
    this.badgeCountTotal += 1;
    this.lastBadgeReceived = new Date();
  }

  static generatePassword() {
    const buf = Buffer.alloc(5);
    return crypto.randomFillSync(buf).toString('hex');
  }
}

const initUser = async (sequelize) => {
  User.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobileNumber: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isBlackListed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      hasCovid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isSingPassVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('password');
        },
      },
      strikeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      salt: {
        type: Sequelize.STRING,
        get() {
          return this.getDataValue('salt');
        },
      },
      avatarPath: {
        type: Sequelize.STRING,
      },
      isValidated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isPasswordReset: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      badgeCountMonthly: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      badgeCountTotal: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastBadgeReceived: {
        type: Sequelize.DATE,
      }
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  console.log(`****[database] User initialized`);
};

module.exports = {User, initUser};
