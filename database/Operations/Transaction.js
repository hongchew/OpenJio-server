const {Transaction} = require('../Models/Transaction');
const {
  retrieveWalletByWalletId,
  retrieveWalletByUserId,
  addWalletBalance,
  deductWalletBalance,
} = require('./Wallet');
const {retrieveUserByEmail} = require('./User');

const getDb = require('../../database/index');

const sequelizeInstance = await getDb().then((db) => db);

/*
  Create a transaction between sender and recipient
  Parameters: (userId: string)
  Return: Transaction object
*/
const createTransaction = async (
  senderWalletId,
  recipientWalletId,
  amount,
  description,
  transactionType, transaction
) => {
  try {
    const newTransaction = Transaction.build({
      amount: amount,
      transactionType: transactionType,
      description: description,
    });
    newTransaction.senderWallet = await retrieveWalletByWalletId(
      senderWalletId
    );
    newTransaction.recipientWallet = await retrieveWalletByUserId(
      recipientWalletId
    );
    await newTransaction.save({
      transaction: transaction
    });
    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Make USER payment
  Parameters: (walletId: UUID, email: string, amount: string, description: string)
  Return: Transaction object
*/
const makeUserPayment = async (walletId, email, amount, description) => {

  console.log('SEQUELIZE INSTANCE: ' + sequelizeInstance);

  // ***Maybe can take out***
  // const t = sequelizeInstance.transaction();


  try {
    const recipient = await retrieveUserByEmail(email);

    if (!recipient) {
      throw 'Recipient with email address: ' + email + ' not found';
    }

    const senderWalletId = walletId;
    const recipientWalletId = recipient.walletId;
    const transactionType = 'USER';

    const result = await sequelizeInstance.transaction(async (t) => {
      // Deduct from sender' wallet
      await deductWalletBalance(
        {
          senderWalletId,
          amount,
        },
        {transaction: t}
      );

      // Add to recipient's wallet
      await addWalletBalance(
        {
          recipientWalletId,
          amount,
        },
        {transaction: t}
      );

      // Create new transaction
      const newTransaction = await createTransaction(
        {
          senderWalletId,
          recipientWalletId,
          amount,
          description,
          transactionType,
        },
        {transaction: t}
      );
      
      console.log(result);
      return newTransaction;

    });

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

/*
  Retrieve one transaction associated by transactionId
  Parameters: (transactionId: string)
  Return: Model.Transaction
*/
const retrieveTransactionByTransactionId = async (transactionId) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        transactionId: transactionId,
      },
    });
    console.log(transaction);
    return transaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createTransaction,
  retrieveAllTransactionsByUserId,
  retrieveTransactionByTransactionId,
  makeUserPayment
};
