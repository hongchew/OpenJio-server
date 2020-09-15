const { Sequelize, Model, DataTypes } = require("sequelize");

class Wallet extends Model {}

const initWallet = async (sequelize) => {
  Wallet.init(
    {
      walletId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      paypalLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      walletLimit: {
        type: DataTypes.DOUBLE,
      },
    },
    {
      sequelize,
      modelName: "Wallet",
    }
  );
  await Wallet.sync();
  console.log(`****[database] Wallet initialized`);
};

module.exports = { Wallet, initWallet };
