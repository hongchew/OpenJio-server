const express = require('express');
const {
  setWalletLimit,
  retrieveWalletByWalletId,
  deleteWalletLimit,
  retrieveAllWallets
} = require('../database/Operations/Wallet');
const router = express.Router();

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
router.get('/retrieve-wallet', async (req, res) => {
  try {
    const wallet = await retrieveWalletByWalletId(req.body.walletId);
    res.status(200).json(wallet);
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
  Endpoint: PUT /wallets/update-wallet
  Content type: JSON Model.Wallet {
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
  Content type:
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
