const express = require('express');
const paypal = require('paypal-rest-sdk');
const {makeTopUp} = require('../database/Operations/Transaction');

const router = express.Router();

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

/*
  Endpoint: POST /paypal/get-client-token
  Content type: -
  Return: Client ID token 
*/

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/topup', (req, res) => {
  var {amount, walletId} = req.query;
  console.log({amount, walletId});
  const successUrl = `http://10.0.2.2:3000/paypal/success?amount=${amount.toString()}&walletId=${walletId}`;
  amount = (amount / 100).toFixed(2);
  console.log(successUrl);
  var create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: successUrl,
      cancel_url: 'http://10.0.2.2:3000/paypal/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'OpenJio Wallet Top Up',
              sku: 'OpenJio Wallet Top Up',
              currency: 'SGD',
              price: amount,
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'SGD',
          total: amount,
        },
        description:
          'Thank you for topping up your OpenJio wallet, we hope you are enjoying the OpenJio experience!',
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.error(error);
      console.error(error.response.details);
      throw error;
    } else {
      console.log('Create Payment Response');
      console.log(payment);
      res.redirect(payment.links[1].href);
    }
  });
});

router.get('/success', (req, res) => {
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var {walletId, amount} = req.query;
  amount = (amount / 100).toFixed(2);

  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: 'SGD',
          total: amount,
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.error(error);
      console.error(error.response.details);
      throw error;
    } else {
      console.log('Get Payment Response');
      console.log(JSON.stringify(payment));
      makeTopUp(
        walletId,
        amount,
        payment.transactions[0].related_resources[0].sale.id //txn id
      ).then((txn) => {
        console.log(txn);
        res.render('success');
      });
    }
  });
});

router.get('/cancel', (req, res) => {
  res.render('cancel');
});

module.exports = router;
