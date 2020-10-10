const {Wallet} = require('../Models/Wallet');

/*
  Create an insert wallet into database
  Parameters: (userId: string)
  Return: Wallet object
*/
const createWallet = async (userId) => {
  try {
    const newWallet = Wallet.build({
      userId,
    });
    await newWallet.save();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create an insert wallet into database
  Parameters: (walletId: string)
  Return: Wallet object (or null)
*/
const retrieveWalletByWalletId = async (walletId) => {
  try {
    const wallet = await Wallet.findOne({
      where: {
        walletId: walletId,
      },
    });
    console.log(wallet);
    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Deduct wallet balance
  Parameters: (walletId: string, amountToDeduct: double)
  Return: Wallet object
*/
const deductWalletBalance = async (walletId, amountToDeduct) => {
  try {
    const wallet = await retrieveWalletByWalletId(walletId);
    wallet.deductFromWallet(amountToDeduct);
    await wallet.save();

    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Add wallet balance
  Parameters: (walletId: string, amountToAdd: double)
  Return: Wallet object
*/
const addWalletBalance = async (walletId, amountToAdd) => {
  try {
    const wallet = await retrieveWalletByWalletId(walletId);
    wallet.topUpWallet(amountToAdd);
    await wallet.save();

    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createWallet,
  deductWalletBalance,
  addWalletBalance,
};
