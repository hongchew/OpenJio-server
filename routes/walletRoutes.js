const express = require('express');
const {Sequelize} = require('sequelize');
const router = express.Router();
const {
  setWalletLimit,
  retrieveWalletByWalletId,
  retrieveWalletByUserId,
  deleteWalletLimit,
  retrieveAllWallets
} = require('../database/Operations/Wallet');

/* http://localhost:3000/wallets/ . */
router.get('/', (req, res) => {
  res.send('Wallet API endpoint ');
});

/*
  Endpoint: GET /wallets/retrieve-wallet
  Content type: JSON {
      walletId: string
  }
  Return: Wallet Object
*/
//working
router.get('/retrieve-wallet/:walletId', async (req, res) => {
  try {
    const wallet = await retrieveWalletByWalletId(req.params.walletId);
    res.status(200).json(wallet);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: GET /wallets/retrieve-wallet-by-userId
  Content type: JSON {
      userId: string
  }
  Return: Wallet Object
*/
router.get('/retrieve-wallet-by-userId/:userId', async (req, res) => {
  try {
    const wallet = await retrieveWalletByUserId(req.params.userId);
    res.json(wallet);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /wallets/remove-wallet-limit
  Content type: JSON {
      walletId: string
  }
  Return: Model.Wallet object with updated properties
*/
router.put('/remove-wallet-limit', async (req, res) => {
  try {
    const updatedWallet = await deleteWalletLimit(req.body.walletId);
    res.status(200).json(updatedWallet);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /wallets/update-wallet-limit
  Content type: JSON {
      walletId: string
      walletLimit: double
      other attributes would not be updated
  }
  Return: Model.Wallet object with updated properties
*/
//Working
router.put('/update-wallet-limit', async (req, res) => {
  try {
    const updatedWallet = await setWalletLimit(
      req.body.walletId,
      req.body.walletLimit
    );
    res.status(200).json(updatedWallet);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: GET /wallets/retrieve-all
  Content type: (null)
  Return: Models.Wallet objects 
-------------------------------- */
router.get('/retrieve-all', async (req, res) => {
  try {
    const wallets = await retrieveAllWallets();
    res.json(wallets);
  } catch (e) {
    res.status(500).json({
      message: 'Error retrieving Wallets!',
    });
  }
});



module.exports = router;
