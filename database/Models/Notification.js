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
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notificationType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notificationStatus: {
        type: DataTypes.STRING,
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
