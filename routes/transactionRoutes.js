const express = require('express');
const {Sequelize} = require('sequelize');
// Import DB
const getDb = require('../database');

const {
  addWalletBalance,
  deductWalletBalance,
} = require('../database/Operations/Wallet');
const {
  retrieveUserByEmail
} = require('../database/Operations/User');
const {
  createTransaction,
  retrieveAllTransactionsByUserId,
  retrieveTransactionByTransactionId,
} = require('../database/Operations/Transaction');

const router = express.Router();

const sequelizeInstance = getDb();

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
    // Sender can send to either email or mobile number
    const recipient = await retrieveUserByEmail(req.body.email);

    if (!recipient) {
      res.status(500).json({message: 'Failed to find recipient with email: ' + req.body.email});
    }

    const senderWalletId = req.body.walletId;
    const recipientWalletId = recipient.walletId;

    const {amount, description} = req.body;
    const transactionType = 'USER';

    // Managed transaction with sequelize & rollback
    try {
      const t = sequelizeInstance.transaction();

      // sequelizeInstance.transaction is not a function (Change to just the functions themselves)
      let result = await sequelizeInstance.transaction(async (t) => {
        // Deduct from sender' wallet
        const deductingFromSender = await deductWalletBalance(
          {
            senderWalletId,
            amount,
          },
          {transaction: t}
        );

        // Add to recipient's wallet
        const addingToRecipient = await addWalletBalance(
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

        res.status(200).json(newTransaction);
      });
    } catch (e) {
      // Automatically rollback transaction if there are any errors
      console.log(e);
      res.status(500).json(e);
    }
  } catch (e) {
    //generic server error
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
