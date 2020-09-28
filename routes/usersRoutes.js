const express = require('express');
const router = express.Router();
const {User} = require('../database/Models/User');
const {
  createUser,
  verifyUserLogin,
  changeUserPassword,
  sendEmail,
  resetUserPassword,
} = require('../database/Operations/User');

/* http://localhost:3000/users/ . */
router.get('/', (req, res) => {
  res.send('users API endpoint ');
});

/*
  Endpoint: POST /users/signup
  Content type: JSON { email: 'string', password: 'string', name: 'string', }
  Return: Model.User object 
*/
router.post('/signup', async (req, res) => {
  try {
    const newCredentials = req.body;
    const newUser = await createUser(
      newCredentials.email,
      newCredentials.password,
      newCredentials.name
    );
    if (!newUser) {
      throw 'user is null, signup failed';
    }
    res.json(newUser);
  } catch (e) {
    console.error(e);
    //delete sensitive information
    e.errors.forEach((err) => delete err.instance);

    if (e.name === 'SequelizeValidationError') {
      // Probably break null validation

      res.status(400).json(e);
    } else if (e.name === 'SequelizeUniqueConstraintError') {
      // email is taken

      // delete sensitive information
      delete e.sql;
      delete e.parent;
      delete e.original;

      res.status(400).json(e);
    } else {
      // generic server error

      res.status(500).json(e);
    }
  }
});

/*
  Endpoint: POST /users/login
  Content type: JSON { email: 'string', password: 'string'}
  Return: Model.User object 
*/
router.post('/login', async (req, res) => {
  try {
    const credentials = req.body;
    const user = await verifyUserLogin(credentials.email, credentials.password);

    if (!user) {
      // login failed, either email or password wrong
      res.status(401).json({message: 'Incorrect Email or Password'});
    } else {
      res.json(user);
    }
  } catch (e) {
    // generic server error

    res.status(500).json(e);
  }
});

/*
  Endpoint: POST /users/change-user-password
  Content type: JSON { email: 'string', currPassword: 'string', newPassword: 'string'}
  Return: JSON message
*/
router.post('/change-password', async (req, res) => {
  try {
    const user = await changeUserPassword(
      req.body.email,
      req.body.currPassword,
      req.body.newPassword
    );

    if (!user) {
      //current password is wrong

      res.status(401).send();
    } else {
      res.status(200).send();
    }
  } catch (e) {
    // generic server error

    // res.status(500).json(e);
    res.json(e);
  }
});

/*
  Endpoint: POST /users/reset-user-password
  Content type: JSON { email: 'string'}
  Return: HTTP status code
*/
router.post('/reset-user-password', async (req, res) => {
  try {
    await resetUserPassword(req.body.email);
    res.status(200).send();
  } catch (e) {
    // generic server error

    res.status(500).json(e);
  }
});

module.exports = router;
