const express = require('express');
const {Sequelize} = require('sequelize');

// Import DB
// const {getDb} = require('../database/index');
// const sequelizeInstance = getDb().then((db) => db);

const {
  addWalletBalance,
  deductWalletBalance,
} = require('../database/Operations/Wallet');
const {retrieveUserByEmail} = require('../database/Operations/User');
const {
  createTransaction,
  retrieveAllTransactionsByUserId,
  retrieveTransactionByTransactionId,
  makeUserPayment
} = require('../database/Operations/Transaction');

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
    // const recipient = await retrieveUserByEmail(req.body.email);
    // const senderWalletId = req.body.walletId;
    // const recipientWalletId = recipient.walletId;
    // const {amount, description} = req.body;
    // const t = sequelizeInstance.transaction();
    // const t = sequelize.transaction();

    const {walletId, email, amount, description} = req.body;
    const newTransaction = await makeUserPayment(walletId, email, amount, description);
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
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await retrieveAllTransactionsByUserId(req.body.userId);
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
      req.body.transactionId
    );
    res.status(200).json(transaction);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;
