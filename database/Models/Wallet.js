const {Sequelize, Model, DataTypes} = require('sequelize');

class Wallet extends Model {
  topUpWallet(amount) {
    this.balance = parseFloat(this.balance) + parseFloat(amount);
    return this.balance;
  }

  deductFromWallet(amount) {
    if (this.balance < amount) {
      throw 'Insufficient Funds Exception';
    // } else if (this.walletLimit && amount > this.walletLimit) {
    //   throw 'Amount exceeds wallet limit'
    } else {
      this.balance = this.balance - amount;
      return this.balance;
    }
  }

  setWalletLimit(limit) {
    this.walletLimit = limit;
  }

  deleteWalletLimit() {
    this.walletLimit = null;
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
