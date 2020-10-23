const express = require('express');
const paypal = require('paypal-rest-sdk');
const axios = require('axios');
const {makeTopUp} = require('../database/Operations/Transaction');

const router = express.Router();
const serverUrl = 'http://10.0.2.2';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
// retrieved from GET https://api.sandbox.paypal.com/v1/catalogs/products
const topUpProductId = 'PROD-50180846VH855234G';
const donateProductId = 'PROD-1AE939259N813830M';

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: clientId,
  client_secret: clientSecret,
});

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/topup', (req, res) => {
  var {amount, walletId} = req.query;
  console.log({amount, walletId});
  const successUrl = `${serverUrl}:3000/paypal/topup-success?amount=${amount.toString()}&walletId=${walletId}`;
  const cancelUrl = `${serverUrl}:3000/paypal/cancel`;
  amount = (amount / 100).toFixed(2);
  console.log(successUrl);
  var create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: successUrl,
      cancel_url: cancelUrl,
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

router.get('/topup-success', (req, res) => {
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

router.get('/monthly-topup', async (req, res) => {
  try {
    var {amount, walletId} = req.query;
    console.log({amount, walletId});

    //#region check if plan with same amount exist
    const plansApi = `https://api.sandbox.paypal.com/v1/billing/plans?product_id=${topUpProductId}`;
    console.log('\nRetrieving all existing plans...');
    const plansResponse = await axios.get(plansApi, {
      headers: {
        'content-type': 'application/json',
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
    });

    const plans = plansResponse.data.plans;
    const amountNumber = (amount / 100).toFixed(2);
    var billingPlan = plans.filter(
      (plan) =>
        plan.name === 'OpenJio Recurrent Top Up' &&
        plan.description === `SGD${amountNumber}`
    )[0];
    console.log('\nTopup billing plan found:')
    console.log(billingPlan);
    if (!billingPlan) {
      // Create new plan
      console.log('\nNo suitable topup plan found, creating new plan...');
      var createPlanJSON = {
        product_id: topUpProductId,
        name: 'OpenJio Recurrent Top Up',
        description: `SGD${amountNumber}`,
        status: 'ACTIVE',
        billing_cycles: [
          {
            frequency: {
              interval_unit: 'MONTH',
              interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: amountNumber,
                currency_code: 'SGD',
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: '0',
            currency_code: 'SGD',
          },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
        taxes: {
          percentage: '0',
          inclusive: true,
        },
      };
      const billingPlanResponse = await axios.post(
        'https://api.sandbox.paypal.com/v1/billing/plans',
        createPlanJSON,
        {
          headers: {
            'content-type': 'application/json',
          },
          auth: {
            username: clientId,
            password: clientSecret,
          },
        }
      );
      billingPlan = billingPlanResponse.data;
      console.log('\nNew billing plan created!');
    }
    console.log('\nBilling plan to be used for new topup subscription:');
    console.log(billingPlan);
    //#endregion

    //#region create new subscription
    const successUrl = `${serverUrl}:3000/paypal/monthly-top-up-success?amount=${amount.toString()}&walletId=${walletId}`;
    const cancelUrl = `${serverUrl}:3000/paypal/cancel`;
    var createSubscriptionJSON = {
      plan_id: billingPlan.id,
      quantity: '1',
      application_context: {
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: successUrl,
        cancel_url: cancelUrl,
      },
    };
    console.log('\nPosting new topup subscription...');
    axios
      .post(
        'https://api.sandbox.paypal.com/v1/billing/subscriptions',
        createSubscriptionJSON,
        {
          headers: {
            'content-type': 'application/json',
          },
          auth: {
            username: clientId,
            password: clientSecret,
          },
        }
      )
      .then((resp) => {
        console.log('\nNew topup subscription created, now pending approval: ');
        console.log(resp.data);
        res.redirect(resp.data.links[0].href);
      })
      .catch((e) => {
        throw e;
      });
    //#endregion
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

router.get('/monthly-top-up-success', (req, res) => {
  console.log('\nTopup subscription approved!');
  console.log(req.query);
  // Fill the database here
  res.render('success');
});

module.exports = router;
