const {Wallet} = require('../Models/Wallet');
const {Sequelize} = require('sequelize');

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
  Retrieve wallet of user via userId
  Parameters: (userId: string)
  Return: Wallet object (or null)
*/
const retrieveWalletByUserId = async (userId) => {
  try {
    const wallet = await Wallet.findOne({
      where: {
        userId: userId,
      },
    });
    console.log(`Wallet info: ${wallet}`);
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

/*
  Set/Edit wallet limit
  Parameters: (walletId: string, limit: double)
  Return: Wallet object
*/
const setWalletLimit = async (walletId, limit) => {
  try {
    const wallet = await retrieveWalletByWalletId(walletId);
    wallet.setWalletLimit(limit);
    await wallet.save();
    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Delete wallet limit
  Parameters: (walletId: string)
  Return: Wallet object
*/
const deleteWalletLimit = async (walletId) => {
  try {
    const wallet = await retrieveWalletByWalletId(walletId);
    wallet.deleteWalletLimit();
    await wallet.save();
    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Make Donation
  Parameters: (walletId: string, donation: double)
  Return: Wallet object
*/
const donate = async (walletId, donation) => {
  try {
    const wallet = await retrieveWalletByWalletId(walletId);
    wallet.deductFromWallet(donation);
    await wallet.save();

    return wallet;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  For API testing:
  Retrieve all wallets from database
  Parameters: (null)
  Return: Array of Wallet objects
---------------------------------------- */
const retrieveAllWallets = async () => {
  try {
    const wallets = await Wallet.findAll({});
    return wallets;
  } catch (e) {
    throw console.error(e);
  }
};

module.exports = {
  createWallet,
  deductWalletBalance,
  addWalletBalance,
  setWalletLimit,
  deleteWalletLimit,
  donate,
  retrieveWalletByWalletId,
  retrieveWalletByUserId,
  retrieveAllWallets
};
