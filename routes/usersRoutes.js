const express = require('express');
const router = express.Router();
const {createUser} = require('../database/Operations/User');

/* http://localhost:3000/users/ . */
router.get('/', (req, res) => {
  res.send('users API endpoint ');
});

/*
    Endpoint: POST /users/signup
    Content type: JSON { email: 'string', password: 'string', name: 'string', }
    Return: Model.User object 
    Throw: 
*/
router.post('/signup', async (req, res) => {
  try {
    const newCredentials = req.body;
    const newUser = await createUser(
      newCredentials.email,
      newCredentials.password,
      newCredentials.name
    );

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
    Throw: 
*/
router.get('/login', (req, res) => {
  res.json({
    Status: 'api not ready yet',
  });
});

module.exports = router;
