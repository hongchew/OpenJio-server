const { Sequelize, Model, DataTypes } = require("sequelize");

class TemperatureLog extends Model {}

const initTemperatureLog = async (sequelize) => {
    TemperatureLog.init(
    {
      temperatureLogId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      temperature: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      riskLevel: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "TemperatureLog",
    }
  );
  await TemperatureLog.sync();
  console.log(`****[database] TemperatureLog initialized`);
};

module.exports = { TemperatureLog, initTemperatureLog };
