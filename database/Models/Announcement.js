const { Sequelize, Model, DataTypes } = require("sequelize");
const AnnouncementStatus = require("../../enum/AnnouncementStatus");
const announcementStatus = require("../../enum/AnnouncementStatus")

class Announcement extends Model {
  disableAnnouncement() {
    this.announcementStatus = announcementStatus.PAST;
  }
  ongoingAnnouncement(){
    this.announcementStatus = AnnouncementStatus.ONGOING;
  }
}

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
        defaultValue: announcementStatus.ACTIVE
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
      closeTime: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Announcement",
    }
  );
  console.log(`****[database] Announcement initialized`);
};

module.exports = { Announcement, initAnnouncement };
