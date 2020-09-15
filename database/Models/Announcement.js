const { Sequelize, Model, DataTypes } = require("sequelize");
const announcementStatus = require("../../enum/AnnouncementStatus")

class Announcement extends Model {}

const initAnnouncement = async (sequelize) => {
  Announcement.init(
    {
      announcementId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      announcementStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: announcementStatus.ONGOING
      },
      startLocation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      closeTIme: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Announcement",
    }
  );
  await Announcement.sync();
  console.log(`****[database] Announcement initialized`);
};

module.exports = { Announcement, initAnnouncement };
