const { Transaction } = require('../Models/Transaction');
const { retrieveWalletByWalletId, retrieveWalletByUserId } = require('./Wallet');

/*
  Create a transaction between sender and recipient
  Parameters: (userId: string)
  Return:  object
*/
const createTransaction = async (senderWalletId, recipientWalletId, amount, description, transactionType) => {
  try {
    const newTransaction = Transaction.build({
      amount: amount,
      transactionType: transactionType,
      description: description,
    });
    newTransaction.senderWallet = await retrieveWalletByWalletId(senderWalletId);
    newTransaction.recipientWallet = await retrieveWalletByUserId(recipientWalletId);
    await newTransaction.save();
    return newTransaction;
  } catch (e) {
    console.log(e); 
    throw e;
  }
};

/*
  Retrieve all transactions associated with given userId
  Parameters: (userId: string)
  Return: Array of Model.Transaction
*/
const retrieveAllTransactionsByUserId = async (userId) => {
    try {
      const transactions = await Transaction.findAll({
        where: {
          userId: userId,
        },
      });
      console.log(transactions);
      return transactions;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

module.exports = {
  createTransaction,
  retrieveAllTransactionsByUserId
};
