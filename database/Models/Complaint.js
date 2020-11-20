const { Sequelize, Model, DataTypes } = require("sequelize");
const supportComplaintStatus = require("../../enum/SupportComplaintStatus")

class Complaint extends Model {
  setPending(){
    this.complaintStatus = supportComplaintStatus.PENDING
  }
  setResolved() {
    this.complaintStatus = supportComplaintStatus.RESOLVED
  }
  setRejected(){
    this.complaintStatus = supportComplaintStatus.REJECTED
  }
}

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
  console.log(`****[database] Complaint initialized`);
};

module.exports = { Complaint, initComplaint };
