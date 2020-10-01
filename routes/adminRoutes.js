const express = require('express');
const router = express.Router();
const {adminLogin} = require('../database/Operations/Admin');

/*
  Endpoint: POST /admin/login
  Content type: JSON { email: 'string', password: 'string'}
  Return: Models.Admin object 
*/
router.post('/adminLogin', async (req, res) => {
  console.log(`HERERE HERER HERERE ${JSON.stringify(req.body)}`)
  try {
    console.log('requesting for admin')
    const credentials = req.body;
    const admin = await adminLogin(credentials.email, credentials.password);

    if (!admin) {
      // login failed, either email or password wrong
      res.status(401).json({message: 'Incorrect Email or Password'});
    } else {
      console.log('i got an admin object')
      res.json(admin);
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
