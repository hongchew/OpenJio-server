const { Sequelize, Model, DataTypes } = require("sequelize");
const requestStatus = require("../../enum/RequestStatus");
const RequestStatus = require("../../enum/RequestStatus");

class Request extends Model {}

const initRequest = async (sequelize) => {
  Request.init(
    {
      requestId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      requestStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: RequestStatus.PENDING
      },
    },
    {
      sequelize,
      modelName: "Request",
    }
  );
  console.log(`****[database] Request initialized`);
};

module.exports = { Request, initRequest };
