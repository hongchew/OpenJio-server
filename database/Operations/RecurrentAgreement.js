const {RecurrentAgreement} = require('../Models/RecurrentAgreement');
const {retrieveUserByUserId} = require('../Operations/User')
const {retrieveWalletByWalletId} = require('../Operations/Wallet')

const recurrentType = require('../../enum/RecurrentTopUpType');

/*
  Create and insert monthly top up into database
  Parameters: (walletId: string, paypalSubscriptionId: string, paypalPlanId: string, amount: number)
  Return: -
*/
const createMonthlyTopUp = async (
  walletId,
  paypalSubscriptionId,
  paypalPlanId,
  amount,
  nextPaymentDate
) => {
  try {
    const newMonthly = RecurrentAgreement.build({
      amount,
      paypalPlanId,
      paypalSubscriptionId,
      walletId,
      recurrentAgreementType: recurrentType.TOP_UP,
      nextPaymentDate
    });
    await newMonthly.save();
  } catch (e) {
    throw e;
  }
};

/*
  Create and insert monthly top up into database
  Parameters: (walletId: string, paypalSubscriptionId: string, paypalPlanId: string, amount: number)
  Return: -
*/
const createMonthlyDonation = async (
  walletId,
  paypalSubscriptionId,
  paypalPlanId,
  amount,
  nextPaymentDate
) => {
  try {
    const newMonthly = RecurrentAgreement.build({
      amount,
      paypalPlanId,
      paypalSubscriptionId,
      walletId,
      recurrentAgreementType: recurrentType.DONATE,
      nextPaymentDate
    });
    await newMonthly.save();
  } catch (e) {
    throw e;
  }
};

/*
  Retrieve recurrent agreement from database with recurrentAgreementId
  Parameters: (recurrentAgreementId: string)
  Return: RecurrentAgreement object (null if not found)
*/
const retrieveRecurrentAgreementByRecurrentAgreementId = async (
  recurrentAgreementId
) => {
  try {
    const agreement = await RecurrentAgreement.findOne({
      where: {
        recurrentAgreementId: recurrentAgreementId,
      },
    });

    return agreement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve recurrent agreement from database with paypalSubscriptionId
  Parameters: (paypalSubscriptionId: string)
  Return: RecurrentAgreement object (null if not found)
*/
const retrieveRecurrentAgreementByPaypalSubscriptionId = async (
  paypalSubscriptionId
) => {
  try {
    const agreement = await RecurrentAgreement.findOne({
      where: {
        paypalSubscriptionId,
      },
    });

    return agreement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Cancel and delete recurrent agreement from database
  Parameters: (recurrentAgreement: RecurrentAgreement)
  Return: User object of new user (null if not found)
*/
const cancelRecurrentAgreement = async (agreement) => {
  try {
    const {walletId} = agreement;
    // delete recurrent agreement from database
    await agreement.destroy()
    // find user by walletId
    const wallet = await retrieveWalletByWalletId(walletId);
    // return retrieveUserByUserId(userId)
    return await retrieveUserByUserId(wallet.userId)

  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Update RecurrentAgreement in database
  Parameters: (recurrentAgreementId: string, options: {fieldsToUpdate: 'newValue'})
  Return: -
*/
const updateRecurrentAgreement = async (
  recurrentAgreementId,
  options
) => {
  try {
    const agreementToUpdate = await retrieveRecurrentAgreementByRecurrentAgreementId(recurrentAgreementId);
    if(!agreementToUpdate){
      throw 'agreement not found'
    }
    return await agreementToUpdate.update(options);
  } catch (e) {
    throw e;
  }
};


module.exports = {
  createMonthlyTopUp,
  createMonthlyDonation,
  retrieveRecurrentAgreementByRecurrentAgreementId,
  cancelRecurrentAgreement,
  updateRecurrentAgreement,
  retrieveRecurrentAgreementByPaypalSubscriptionId
};
