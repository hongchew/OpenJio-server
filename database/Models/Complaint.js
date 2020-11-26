const {Sequelize, Model, DataTypes} = require('sequelize');
const COMPLAINT_STATUS = require('../../enum/ComplaintStatus');

class Complaint extends Model {
  setPending() {
    this.complaintStatus = COMPLAINT_STATUS.PENDING;
  }
  setResolved() {
    this.complaintStatus = COMPLAINT_STATUS.RESOLVED;
  }
  setRejected() {
    this.complaintStatus = COMPLAINT_STATUS.REJECTED;
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
        defaultValue: COMPLAINT_STATUS.PENDING,
      },
    },
    {
      sequelize,
      modelName: 'Complaint',
    }
  );
  console.log(`****[database] Complaint initialized`);
};

module.exports = {Complaint, initComplaint};
