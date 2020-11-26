const { Sequelize, Model, DataTypes } = require("sequelize");

class OutbreakZone extends Model {}

const initOutbreakZone = async (sequelize) => {
    OutbreakZone.init(
    {
      outbreakZoneId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currentStatus: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "OutbreakZone",
    }
  );
  console.log(`****[database] OutbreakZone initialized`);
};

module.exports = { OutbreakZone, initOutbreakZone };
