const express = require('express');
const {createAdmin} = require('../database/Operations/Admin');
const router = express.Router();

/* http://localhost:3000/admin/ . */
router.get('/', (req, res) => {
  res.send('Admin API endpoint ');
});

/*
  Endpoint: POST /admin/register
  Content type: JSON { name: 'string', email: 'string', password: 'string', adminType: 'string'}
  Return: Model.Admin object 
*/
router.post('/register', async (req, res) => {
  try {
    const newCredentials = req.body;
    const newAdmin = await createAdmin(
      newCredentials.name,
      newCredentials.email,
      newCredentials.password,
      newCredentials.adminType
    );
    if (!newAdmin) {
      throw 'signup failed';
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

module.exports = router;
