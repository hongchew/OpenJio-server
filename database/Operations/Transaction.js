const {Transaction} = require('../Models/Transaction');
const {Op} = require('sequelize');
const {
  retrieveWalletByWalletId,
  retrieveWalletByUserId,
  addWalletBalance,
  deductWalletBalance,
} = require('./Wallet');
const {retrieveUserByEmail} = require('./User');
const transactionTypeEnum = require('../../enum/TransactionType');

// For Managed Transaction (Archived for now)
// const getDb = require('../../database/index');
// const sequelizeInstance = await getDb().then((db) => db);

/*
  Create an user transaction between sender and recipient
  Parameters: (userId: string)
  Return: Transaction object
*/
const createUserTransaction = async (
  senderWalletId,
  recipientWalletId,
  amount,
  description,
  transactionType
) => {
  try {
    const newTransaction = Transaction.build({
      senderWalletId: senderWalletId,
      recipientWalletId: recipientWalletId,
      amount: amount,
      description: description,
      transactionType: transactionType,
    });

    await newTransaction.save();

    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create a withdraw/donate transaction from sender
  Parameters: (userId: string)
  Return: Transaction object
*/
const createWithdrawDonateTransaction = async (
  senderWalletId,
  amount,
  transactionType
) => {
  try {
    const newTransaction = Transaction.build({
      senderWalletId: senderWalletId,
      amount: amount,
      transactionType: transactionType,
    });

    await newTransaction.save();

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
  // Archived
  // const sequelizeInstance = getDb();
  // const t = sequelizeInstance.transaction();

  try {
    const recipient = await retrieveUserByEmail(email);

    if (!recipient) {
      throw 'Recipient with email address: ' + email + ' not found';
    }

    const senderWalletId = walletId;

    const recipientWallet = await retrieveWalletByUserId(recipient.userId);
    const recipientWalletId = recipientWallet.walletId;

    const transactionType = 'USER';
    // Deduct from sender' wallet
    await deductWalletBalance(senderWalletId, amount);

    // Add to recipient's wallet
    await addWalletBalance(recipientWalletId, amount);

    // Create new transaction
    const newTransaction = await createUserTransaction(
      senderWalletId,
      recipientWalletId,
      amount,
      description,
      transactionTypeEnum.USER
    );

    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Withdraw money from wallet (transaction)
  Parameters: (walletId: UUID, amount: string)
  Return: Transaction object
*/
const makeWithdrawal = async (walletId, amount) => {
  try {
    const userWalletId = walletId;
    const transactionType = 'WITHDRAW';

    // Deduct from wallet
    await deductWalletBalance(userWalletId, amount);

    // Create new transaction
    const newTransaction = await createWithdrawDonateTransaction(
      userWalletId,
      amount,
      transactionTypeEnum.WITHDRAW
    );

    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Donate money from wallet (transaction)
  Parameters: (walletId: UUID, amount: string)
  Return: Transaction object
*/
const makeDonation = async (walletId, amount) => {
  try {
    const userWalletId = walletId;
    const transactionType = 'DONATE';

    // Deduct from wallet
    await deductWalletBalance(userWalletId, amount);

    // Create new transaction
    const newTransaction = await createWithdrawDonateTransaction(
      userWalletId,
      amount,
      transactionTypeEnum.DONATE
    );
    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all transactions
  Parameters: ()
  Return: Array of Model.Transaction
*/
const retrieveAllTransactions = async () => {
  try {
    const transactions = await Transaction.findAll();
    return transactions;
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
    // Note got senderWalletId & recipientWalletId in a transaction(Possible to split)
    const wallet = await retrieveWalletByUserId(userId);
    const walletId = wallet.walletId;

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{senderWalletId: walletId}, {recipientWalletId: walletId}],
      },
    });
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
    return transaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create a top up transaction
  Parameters: (walletId: string, amount: double)
  Return: Transaction object
*/
const createTopUpTransaction = async (walletId, amount, paypalId) => {
  try {
    const newTransaction = Transaction.build({
      recipientWalletId: walletId,
      amount: amount,
      description: `Top Up of ${amount}, Paypal Transaction Id: ${paypalId}`,
      transactionType: transactionTypeEnum.TOP_UP,
    });

    await newTransaction.save();

    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Make a top up
  Parameters: (walletId: string, amount: double)
  Return: Transaction object
*/
const makeTopUp = async (walletId, amount, paypalId) => {
  try {
    await addWalletBalance(walletId, amount);
    const transaction = await createTopUpTransaction(
      walletId,
      amount,
      paypalId
    );

    return transaction
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createUserTransaction,
  createWithdrawDonateTransaction,
  retrieveAllTransactionsByUserId,
  retrieveTransactionByTransactionId,
  makeUserPayment,
  makeWithdrawal,
  makeDonation,
  retrieveAllTransactions,
  makeTopUp,
};
