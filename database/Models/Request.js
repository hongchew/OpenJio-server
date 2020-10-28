const {Sequelize, Model, DataTypes} = require('sequelize');
const RequestStatus = require('../../enum/RequestStatus');

class Request extends Model {
  scheduleRequest() {
    this.requestStatus = RequestStatus.SCHEDULED;
  }

  rejectRequest() {
    this.requestStatus = RequestStatus.REJECTED;
  }

  doingRequest() {
    this.requestStatus = RequestStatus.DOING;
  }

  completeRequest() {
    this.requestStatus = RequestStatus.COMPLETED;
  }

  verifyRequest() {
    this.requestStatus = RequestStatus.VERIFED;
  }
}

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
        defaultValue: RequestStatus.PENDING,
      },
    },
    {
      sequelize,
      modelName: 'Request',
    }
  );
  console.log(`****[database] Request initialized`);
};

module.exports = {Request, initRequest};
