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
      hasSymptoms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      stayHomeNotice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TemperatureLog",
    }
  );
  console.log(`****[database] TemperatureLog initialized`);
};

module.exports = { TemperatureLog, initTemperatureLog };
