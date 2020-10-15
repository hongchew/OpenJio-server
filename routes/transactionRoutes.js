const express = require('express');
const {Sequelize} = require('sequelize');

// Import DB
// const {getDb} = require('../database/index');
// const sequelizeInstance = getDb().then((db) => db);

const {
  retrieveAllTransactionsByUserId,
  retrieveTransactionByTransactionId,
  retrieveAllTransactions,
  makeUserPayment,
  makeWithdrawal,
  makeDonation,
} = require('../database/Operations/Transaction');
const {
  retrieveWalletByUserId,
  retrieveWalletByWalletId,
} = require('../database/Operations/Wallet');
const {retrieveUserByUserId} = require('../database/Operations/User');

const router = express.Router();

/* http://localhost:3000/transactions/ . */
router.get('/', (req, res) => {
  res.send('Transaction API endpoint ');
});

/*
  Endpoint: POST /transactions/process-payment
  Content type: JSON { walletId: 'UUID', email: 'string', amount: 'string', description: 'string'}
  Return: Model.Transaction object 
*/
router.post('/process-payment', async (req, res) => {
  try {
    const {walletId, email, amount, description} = req.body;
    const newTransaction = await makeUserPayment(
      walletId,
      email,
      amount,
      description
    );
    res.status(200).json(newTransaction);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: POST /transactions/withdraw
  Content type: JSON { walletId: 'UUID', amount: 'string' }
  Return: Model.Transaction object 
*/
router.post('/withdraw', async (req, res) => {
  try {
    const {walletId, amount} = req.body;
    const newTransaction = await makeWithdrawal(walletId, amount);
    res.status(200).json(newTransaction);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: POST /transactions/donate
  Content type: JSON { walletId: 'UUID', amount: 'string'}
  Return: Model.Transaction object 
*/
router.post('/donate', async (req, res) => {
  try {
    const {walletId, amount} = req.body;
    const newTransaction = await makeDonation(walletId, amount);
    res.status(200).json(newTransaction);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: GET /transactions/:userId
  Content type: JSON { userId: UUID}
  Return: Array of all transaction objects under the user
*/
router.get('/retrieve-all', async (req, res) => {
  try {
    const transactions = await retrieveAllTransactions();
    res.status(200).json(transactions);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: GET /transactions/:userId
  Content type: JSON { userId: UUID}
  Return: Array of all transaction objects under the user
*/
router.get('/by/:userId', async (req, res) => {
  try {
    const transactions = await retrieveAllTransactionsByUserId(
      req.params.userId
    );
    res.status(200).json(transactions);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: GET /transactions/:transactionId
  Content type: JSON { transactionId: UUID }
  Return: Model.Transaction object 
*/
router.get('/:transactionId', async (req, res) => {
  try {
    const transaction = await retrieveTransactionByTransactionId(
      req.params.transactionId
    );
    if (transaction.recipientWalletId != null) {
      const recipientWallet = await retrieveWalletByWalletId(
        transaction.recipientWalletId
      );
      const recipientDetails = await retrieveUserByUserId(
        recipientWallet.userId
      );
      const selectedRecipientDetails = {
        name: recipientDetails.name,
        email: recipientDetails.email,
      };
      transaction.recipientWalletId = selectedRecipientDetails;
    }

    res.status(200).json(transaction);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;
