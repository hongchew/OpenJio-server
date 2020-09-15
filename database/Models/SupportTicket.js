const { Sequelize, Model, DataTypes } = require("sequelize");

class SupportTicket extends Model {}

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
      },
    },
    {
      sequelize,
      modelName: "SupportTicket",
    }
  );
  await SupportTicket.sync();
  console.log(`****[database] SupportTicket initialized`);
};

module.exports = { SupportTicket, initSupportTicket };
