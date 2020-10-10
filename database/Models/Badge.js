const {Sequelize, Model, DataTypes} = require('sequelize');

class Badge extends Model {
  incrementBadgeCount() {
    this.monthlyCounter += 1;
    this.totalCounter += 1;
  }
}

const initBadge = async (sequelize) => {
  Badge.init(
    {
      badgeId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      badgeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      monthlyCounter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalCounter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Badge',
    }
  );
  console.log(`****[database] Badge initialized`);
};

module.exports = {Badge, initBadge};
