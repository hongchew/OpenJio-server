const express = require('express');
const router = express.Router();

/* http://localhost:3000/admin/ . */
router.get('/', (req, res) => {
  res.send('admin API endpoint ');
});

/*
  Endpoint: POST /admin/signup
  Content type: JSON { name: 'string', email: 'string', password: 'string',, }
  Return: Model.User object 
*/
router.post('/signup', async (req, res) => {
  try {
    const newCredentials = req.body;
    const newAdmin = await createAdmin(
      newCredentials.email,
      newCredentials.password,
      newCredentials.name
    );
    if (!newAdmin) {
      throw 'admin is null, signup failed';
    }
    res.json(newAdmin);
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
  Endpoint: POST /admin/login
  Content type: JSON { email: 'string', password: 'string'}
  Return: Model.User object 
*/
router.post('/login', async (req, res) => {
  try {
    const credentials = req.body;
    const user = await verifyLogin(credentials.email, credentials.password);

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

module.exports = router;
