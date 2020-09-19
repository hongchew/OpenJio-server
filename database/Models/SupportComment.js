const { Sequelize, Model, DataTypes } = require("sequelize");

class SupportComment extends Model {}

const initSupportComment = async (sequelize) => {
  SupportComment.init(
    {
      supportCommentId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPostedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "SupportComment",
    }
  );
  console.log(`****[database] SupportComment initialized`);
};

module.exports = { SupportComment, initSupportComment };
