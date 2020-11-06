const {Sequelize, Model, DataTypes} = require('sequelize');

class RecurrentAgreement extends Model {}

const initRecurrentAgreement = async (sequelize) => {
  RecurrentAgreement.init(
    {
      recurrentAgreementId: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      paypalSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paypalPlanId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      recurrentAgreementType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nextPaymentDate: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'RecurrentAgreement',
    }
  );
  console.log(`****[database] RecurrentAgreement initialized`);
};

module.exports = {RecurrentAgreement, initRecurrentAgreement};
