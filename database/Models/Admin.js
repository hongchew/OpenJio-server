const { Sequelize, Model, DataTypes } = require("sequelize");

class Admin extends Model {}

const initAdmin = async (sequelize) => {
  Admin.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      adminType: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  await Admin.sync();
  console.log(`****[database] Admin initialized`);
};

module.exports = { Admin, initAdmin };
