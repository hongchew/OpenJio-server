const { Sequelize, Model, DataTypes } = require("sequelize");

class RecurrentTopUp extends Model {}

const initRecurrentTopUp = async (sequelize) => {
    RecurrentTopUp.init(
    {
      recurrentTopUpId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      topUpAmount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      timeInterval: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "RecurrentTopUp",
    }
  );
  console.log(`****[database] RecurrentTopUp initialized`);
};

module.exports = { RecurrentTopUp, initRecurrentTopUp };
