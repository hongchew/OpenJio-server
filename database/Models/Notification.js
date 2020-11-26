const { Sequelize, Model, DataTypes } = require("sequelize");

class Notification extends Model {}

const initNotification = async (sequelize) => {
    Notification.init(
    {
      notificationId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  console.log(`****[database] Notification initialized`);
};

module.exports = { Notification, initNotification };
