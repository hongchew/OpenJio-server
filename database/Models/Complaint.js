const { Sequelize, Model, DataTypes } = require("sequelize");
const supportComplaintStatus = require("../../enum/SupportComplaintStatus")

class Complaint extends Model {}

const initComplaint = async (sequelize) => {
    Complaint.init(
    {
      complaintId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      adminResponse: {
        type: DataTypes.STRING,
      },
      complaintStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: supportComplaintStatus.PENDING
      },
    },
    {
      sequelize,
      modelName: "Complaint",
    }
  );
  await Complaint.sync();
  console.log(`****[database] Complaint initialized`);
};

module.exports = { Complaint, initComplaint };
