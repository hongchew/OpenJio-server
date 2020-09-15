const { Sequelize, Model, DataTypes } = require("sequelize");

class Transaction extends Model {}

const initTransaction = async (sequelize) => {
    Transaction.init(
    {
      transactionId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      transactionType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  await Transaction.sync();
  console.log(`****[database] Transaction initialized`);
};

module.exports = { Transaction, initTransaction };
