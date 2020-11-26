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
const recurrTypeEnum = require('../../enum/RecurrentTopUpType');
const {RecurrentAgreement} = require('../Models/RecurrentAgreement');
const {sendNotification} = require('../Operations/Notifications');
const {Wallet} = require('../Models/Wallet');

// For Managed Transaction (Archived for now)
// const getDb = require('../../database/index');
// const sequelizeInstance = await getDb().then((db) => db);

/*
  Create an user transaction between sender and recipient
  Parameters: (senderWalletId, recipientWalletId, amount, description, transactionType)
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

    const sender = await retrieveWalletByWalletId(senderWalletId).then(
      async (wallet) => {
        return await wallet.getUser();
      }
    );
    const recipient = await retrieveWalletByWalletId(recipientWalletId).then(
      async (wallet) => {
        return await wallet.getUser();
      }
    );

    await sendNotification(
      recipient.userId,
      `Received S$${amount} from ${sender.name}`,
      `Transaction ID: ${newTransaction.transactionId}`
    );

    return newTransaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create a withdraw/donate transaction from sender
  Parameters: (senderWalletId, amount, transactionType)
  Return: Transaction object
*/
const createWithdrawDonateTransaction = async (
  senderWalletId,
  amount,
  transactionType,
  description = 'No Description was asssociated with this transaction'
) => {
  try {
    const newTransaction = Transaction.build({
      senderWalletId: senderWalletId,
      amount: amount,
      transactionType: transactionType,
      description: description,
    });

    newTransaction.description =
      newTransaction.description + newTransaction.transactionId;

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

    // Deduct from wallet
    await deductWalletBalance(userWalletId, amount);

    // Create new transaction
    const newTransaction = await createWithdrawDonateTransaction(
      userWalletId,
      amount,
      transactionTypeEnum.WITHDRAW,
      `Withdrawal of SGD${parseFloat(amount).toFixed(2)}, Transaction ID: `
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
const makeDonation = async (walletId, amount, recurr = false, desc = null) => {
  try {
    const userWalletId = walletId;

    // Deduct from wallet
    if (!recurr) {
      await deductWalletBalance(userWalletId, amount);
    }

    // Create new transaction
    const newTransaction = await createWithdrawDonateTransaction(
      userWalletId,
      amount,
      transactionTypeEnum.DONATE,
      desc
        ? desc
        : `Donation of SGD${parseFloat(amount).toFixed(2)}, Transaction ID: `
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
const createTopUpTransaction = async (
  walletId,
  amount,
  paypalId,
  desc = null
) => {
  try {
    const newTransaction = Transaction.build({
      recipientWalletId: walletId,
      amount: amount,
      description: desc
        ? desc
        : `Top Up of SGD${parseFloat(amount).toFixed(
            2
          )},\n Paypal Transaction Id: ${paypalId}`,
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
const makeTopUp = async (walletId, amount, paypalId, desc = null) => {
  try {
    await addWalletBalance(walletId, amount);
    const transaction = await createTopUpTransaction(
      walletId,
      amount,
      paypalId,
      desc
    );

    return transaction;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Make a recurring transaction with recurring transaction webhook
  Parameters: (subscriptionId: string, amount: double, paypalId: string,)
  Return: RecurrentAgreement object
*/
const makeRecurrentTransaction = async (subscriptionId, amount, paypalId) => {
  try {
    console.log([subscriptionId, amount, paypalId]);
    const agreement = await RecurrentAgreement.findOne({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
      include: [{model: Wallet}],
    });

    if (agreement.recurrentAgreementType === recurrTypeEnum.TOP_UP) {
      console.log('Recurring TOP_UP payment webhook received');
      await makeTopUp(
        agreement.walletId,
        amount,
        paypalId,
        `Monthly Top Up of SGD${parseFloat(amount).toFixed(
          2
        )},\nPaypal Transaction Id: ${paypalId}`
      );

      await sendNotification(
        agreement.Wallet.userId,
        `Monthly Top Up Success`,
        `S$${amount} was added to your OpenJio Wallet! Refresh your wallet to see the latest amount!`
      );
    }
    if (agreement.recurrentAgreementType === recurrTypeEnum.DONATE) {
      console.log('Recurring DONATE payment webhook received');
      await makeDonation(
        agreement.walletId,
        amount,
        true,
        `Monthly Donation of SGD${parseFloat(amount).toFixed(
          2
        )} via Paypal directly,\nPaypal Transaction Id: ${paypalId}`
      );

      await sendNotification(
        agreement.Wallet.userId,
        `Monthly Donation Success`,
        `You had donated S$${amount} from Paypal to help with the operations of OpenJio. Thank you for your support!`
      );
    }
    return agreement;
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
  makeRecurrentTransaction,
};
