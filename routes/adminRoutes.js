const express = require('express');
const {Sequelize} = require('sequelize');
const router = express.Router();

const {
  createAdmin,
  changeAdminPassword,
  resetAdminPassword,
  retrieveAllAdminAccounts,
  updateAdmin,
  deleteAdminAccount,
  retrieveAdminByAdminId,
  verifyAdminLogin,
} = require('../database/Operations/Admin');

/* http://localhost:3000/admins/ . */
router.get('/', (req, res) => {
  res.send('Admin API endpoint ');
});

/*
  Endpoint: POST /admins/register
  Content type: JSON { name: 'string', email: 'string', password: 'string', adminType: 'string'}
  Return: Model.Admin object 
*/
router.post('/register', async (req, res) => {
  try {
    var newAdmin;
    if (req.body.adminType === 'superAdmin') {
      newAdmin = await createAdmin(
        req.body.name,
        req.body.email,
        req.body.password,
        'SUPER_ADMIN'
      );
    } else {
      newAdmin = await createAdmin(
        req.body.name,
        req.body.email,
        req.body.password,
        'ADMIN'
      );
    }

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
  Endpoint: PUT /admins/change-password
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
      res.status(200).json({
        message: 'Password successfully changed!',
      });
    }
  } catch (e) {
    // generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /admins/reset-password
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

/* --------------------------------
  Endpoint: GET /admins/retrieve-all
  Content type:
  Return: Models.Admin objects 
-------------------------------- */
router.get('/retrieve-all', async (req, res) => {
  try {
    const admins = await retrieveAllAdminAccounts();
    res.json(admins);
  } catch (e) {
    res.status(500).json({
      message: 'Error retrieving Admin Accounts!',
    });
  }
});

/* --------------------------------
  Endpoint: GET /admins/retrieve
  Content type: JSON { adminId: 'UUID'}
  Return: Models.Admin objects 
-------------------------------- */
router.get('/retrieve', async (req, res) => {
  try {
    const admin = await retrieveAdminByAdminId(req.body.adminId);
    res.json(admin);
  } catch (e) {
    res.status(500).json({
      message: 'Error retrieving admin ' + req.body.adminId,
    });
  }
});

/*
  Endpoint: PUT /admins/update-admin
  Content type: JSON Model.Admin {
    adminId: string,
    name: string,
    email: string,
    adminType: string
  } * only adminId is compulsory, every other field can be on a need-to-update basis.
  Return: Model.Admin object with updated properties
*/
router.put('/update-admin', async (req, res) => {
  const adminId = req.body.adminId;

  try {
    const updatedAdmin = await updateAdmin(req.body);
    res.status(200).json(updatedAdmin);
  } catch (e) {
    //generic server error
    res.status(500).json({
      message: 'Error updating Admin by ID: ' + adminId,
    });
  }
});

/* --------------------------------
  Endpoint: DELETE /admins/:adminId
  Content type: 
  Return: Models.Admin object 
-------------------------------- */
router.delete('/:adminId', async (req, res) => {
  const adminId = req.params.adminId;

  try {
    await deleteAdminAccount(adminId);

    res.status(200).json({
      message: 'Successfully deleted admin with id = ' + adminId,
    });
  } catch (e) {
    res.status(500).json({
      message: 'Error deleting Admin by Id: ' + adminId,
    });
  }
});

/*--------------------------------
  Endpoint: POST /admins/login
  Content type: JSON { email: 'string', password: 'string'}
  Return: Admin object
-------------------------------- */
router.post('/login', async (req, res) => {
  try {
    const credentials = req.body;
    const admin = await verifyAdminLogin(
      credentials.email,
      credentials.password
    );

    if (!admin) {
      // login failed, either email or password wrong
      res.status(401).json({message: 'Incorrect Email or Password'});
    } else {
      //return an admin name and adminId
      res.json(admin);
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
