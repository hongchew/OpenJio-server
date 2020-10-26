const {RecurrentAgreement} = require('../Models/RecurrentAgreement');
const {Wallet} = require('../Models/Wallet');

const recurrentType = require('../../enum/RecurrentTopUpType');

/*
  Create and insert monthly top up into database
  Parameters: (walletId: string, paypalSubscriptionId: string, paypalPlanId: string, amount: number)
  Return: User object of new user (null if not found)
*/
const createMonthlyTopUp = async (
  walletId,
  paypalSubscriptionId,
  paypalPlanId,
  amount
) => {
  try {
    const newMonthly = RecurrentAgreement.build({
      amount,
      paypalPlanId,
      paypalSubscriptionId,
      walletId,
      recurrentAgreementType: recurrentType.TOP_UP
    })
    await newMonthly.save();
    return newMonthly
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createMonthlyTopUp
}