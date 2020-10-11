const express = require('express');
const {setWalletLimit} = require('../database/Operations/Wallet');
const router = express.Router();

/* http://localhost:3000/wallets/ . */
router.get('/', (req, res) => {
  res.send('Wallet API endpoint ');
});

/*
  Endpoint: GET /wallets/:walletId
  Content type: -
  Return: Wallet Object
*/
router.get('/:walletId', async (req, res) => {
  try {
    const wallet = await retrieveWalletByWalletId(req.params.walletId);
    res.status(200).json(wallet);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /wallets/update-wallet
  Content type: JSON Model.Wallet {
      walletId: string
      walletLimit: double
  }
  Return: Model.Wallet object with updated properties
*/
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
