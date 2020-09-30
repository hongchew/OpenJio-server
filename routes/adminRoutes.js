const express = require('express');
const {createAdmin, changeAdminPassword, resetAdminPassword} = require('../database/Operations/Admin');
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
      throw 'Admin creation failed!';
    }
    res.json(newAdmin);
  } catch (e) {
    console.error(e);
    //delete sensitive information
    e.errors.forEach((err) => delete err.instance);
    if (e.name === 'SequelizeValidationError') {
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
  Endpoint: PUT /admin/change-password
  Content type: JSON { email: 'string', currPassword: 'string', newPassword: 'string'}
  Return: HTTP status code
*/
router.put('/change-password', async (req, res) => {
  try {
    const admin = await changeAdminPassword(
      req.body.email,
      req.body.currPassword,
      req.body.newPassword
    );

    if (!admin) {
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
  Endpoint: PUT /admin/reset-password
  Content type: JSON { email: 'string'}
  Return: HTTP status code
*/
router.put('/reset-password', async (req, res) => {
  try {
    await resetAdminPassword(req.body.email);
    res.status(200).send();
  } catch (e) {
    // generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /admin/update-admin
  Content type: JSON Model.Admin {
    adminId: string,
    name: string,
    email: string,
    adminType: string
  } * only adminId is compulsory, every other field can be on a need-to-update basis.
  Return: Model.Admin object with updated properties
*/
router.put('/update-admin', async (req, res) => {
  try {
    const adminId = req.body.adminId;
    const updatedAdmin = await updateAdmin(req.body);
    res.status(200).json(updatedAdmin);
  } catch (e) {
    //generic server error
    res.status(500).json({
      message: 'Error updating Admin by ID: ' + adminId;
    });
  }
});



module.exports = router;
