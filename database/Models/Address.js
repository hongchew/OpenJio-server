const { Sequelize, Model, DataTypes } = require("sequelize");

class Address extends Model {}

const initAddress = async (sequelize) => {
  Address.init(
    {
      addressId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      line1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      line2: {
        type: DataTypes.STRING,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: "Address",
    }
  );
  console.log(`****[database] Address initialized`);
};

module.exports = { Address, initAddress };
