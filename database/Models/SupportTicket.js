const {Sequelize, Model, DataTypes} = require('sequelize');
const SUPPORT_STATUS = require('../../enum/ComplaintStatus');
// const SUPPORT_TYPE = require('../../enum/SupportTicket');

class SupportTicket extends Model {
  setPending() {
    this.supportStatus = SUPPORT_STATUS.PENDING;
  }
  setResolved() {
    this.supportStatus = SUPPORT_STATUS.RESOLVED;
  }
  setRejected() {
    this.supportStatus = SUPPORT_STATUS.REJECTED;
  }
}

const initSupportTicket = async (sequelize) => {
  SupportTicket.init(
    {
      supportTicketId: {
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
      supportType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supportStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: SUPPORT_STATUS.PENDING,
      },
    },
    {
      sequelize,
      modelName: 'SupportTicket',
    }
  );
  console.log(`****[database] SupportTicket initialized`);
};

module.exports = {SupportTicket, initSupportTicket};
