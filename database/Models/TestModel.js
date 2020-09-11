const {Sequelize, Model, DataTypes } = require("sequelize");

class TestModel extends Model {}

const initTestModel = async (sequelize) => {
  TestModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      testId: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "TestModel",
    }
  );
  await TestModel.sync();
};

module.exports = { TestModel, initTestModel };
