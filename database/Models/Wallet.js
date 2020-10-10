const {Sequelize, Model, DataTypes} = require('sequelize');

class Wallet extends Model {
  topUpWallet(amount) {
    this.balance = this.balance + amount;
    return this.balance;
  }

  deductFromWallet(amount) {
    if (this.balance < amount) {
      throw 'Insufficient Funds Exception';
    } else {
      this.balance = this.balance - amount;
      return this.balance;
    }
  }
}

const initWallet = async (sequelize) => {
  Wallet.init(
    {
      walletId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      paypalLink: {
        type: DataTypes.STRING,
      },
      walletLimit: {
        type: DataTypes.DOUBLE,
      },
    },
    {
      sequelize,
      modelName: 'Wallet',
    }
  );
  console.log(`****[database] Wallet initialized`);
};

module.exports = {Wallet, initWallet};
