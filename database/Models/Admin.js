const { Sequelize, Model, DataTypes } = require("sequelize");

class Admin extends Model {}

const initAdmin = async (sequelize) => {
  Admin.init(
    {
      adminId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      adminType: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  console.log(`****[database] Admin initialized`);
};

module.exports = { Admin, initAdmin };
