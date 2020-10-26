const express = require('express');
const paypal = require('paypal-rest-sdk');
const axios = require('axios');
const {
  makeTopUp,
  makeRecurrentTransaction,
} = require('../database/Operations/Transaction');
const {
  createMonthlyTopUp,
  retrieveRecurrentAgreementByRecurrentAgreementId,
  cancelRecurrentAgreement,
} = require('../database/Operations/RecurrentAgreement');

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

/*
  Endpoint: POST /paypal/webhook-test
  Content type: -
  Return: print webhook calls
*/
router.post('/webhook-test', async (req, res) => {
  res.status(200).send();
  const payment = req.body.resource;
  if (payment.billing_agreement_id) {
    //is a recur
    //add to wallet
    console.log('recurring payment, updating db...');
    await makeRecurrentTransaction(
      payment.billing_agreement_id,
      payment.amount.total,
      payment.id
    );
  } else {
    console.log('one time payment, ignoring');
  }
  console.log(payment);
});

/*
  Endpoint: POST /paypal/webhook-test
  Content type: -
  Return: print webhook calls
*/
router.post('/payment-sale-completed-webhook', async (req, res) => {
  res.status(200).send();
  const payment = req.body.resource;
  if (payment.billing_agreement_id) {
    //is a recur
    //add to wallet
    console.log('recurring payment, updating db...');
    await makeRecurrentTopUp(
      payment.billing_agreement_id,
      payment.amount.total,
      payment.id
    );
  } else {
    console.log('one time payment, ignoring');
  }
  console.log(payment);
});

/*
  Endpoint: GET /paypal/top-up
  Content type: -
  Return: redirect to /topup-success
*/
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

/*
  Endpoint: GET /paypal/top-up-success
  Content type: -
  Return: redirect to success.ejs
*/
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

/*
  Endpoint: GET /paypal/cancel
  Content type: -
  Return: redirect to cancel.ejs
*/
router.get('/cancel', (req, res) => {
  res.render('cancel');
});

/*
  Endpoint: GET /paypal/monthly-top-up
  Content type: -
  Return: redirect to /monthly-top-up-success
*/
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
    console.log('\nTopup billing plan found:');
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

/*
  Endpoint: GET /paypal/monthly-top-up-success
  Content type: -
  Return: redirect to success.ejs
*/
router.get('/monthly-top-up-success', async (req, res) => {
  try {
    console.log('\nTopup subscription approved!');
    console.log(req.query);
    // Fill the database here
    var {amount, walletId, subscription_id} = req.query;
    const subscriptionResponse = await axios.get(
      `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscription_id}`,
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
    const subscription = subscriptionResponse.data;
    console.log('subscription response:');
    console.log(subscription);
    amount = (amount / 100).toFixed(2);

    await createMonthlyTopUp(
      walletId,
      subscription.id,
      subscription.plan_id,
      amount
    );

    res.render('success');
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: DELETE /paypal/recurrent-agreement/:recurrentAgreementId
  Content type: -
  Return: return updated user object
*/
router.delete(
  '/recurrent-agreement/:recurrentAgreementId',
  async (req, res) => {
    try {
      const {recurrentAgreementId} = req.params;
      const agreement = await retrieveRecurrentAgreementByRecurrentAgreementId(
        recurrentAgreementId
      );
      if (!agreement) {
        res.status(404).json({message: 'agreement not found'});
      }
      // call paypal API to cancel subscription
      const resp = await axios.post(
        `https://api.sandbox.paypal.com/v1/billing/subscriptions/${agreement.paypalSubscriptionId}/cancel`,
        {reason: 'Cancellation of Recurrent Payment'},
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

      if (resp.status === 204) {
        const user = await cancelRecurrentAgreement(agreement);
        res.status(200).json(user);
      }

      res.status(resp.status).json(resp.data);
    } catch (e) {
      console.log(e);
      res.status(e.status ? e.status : 500).json(e);
    }
  }
);

module.exports = router;
