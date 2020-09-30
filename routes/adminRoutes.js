const express = require('express');
const {Sequelize} = require('sequelize');
const router = express.Router();

// Suggestion & testing (YZ)
const currentAdmin = require('../database/Models/Admin.js');

// Create Op (YZ)
// const databaseModels = require('../database/Models'); // Having error
// const Op = databaseModels.Sequelize.Op;
// End of testing (YZ)

const {
  retrieveAdminByAdminId,
  retrieveAdminByEmail,
  adminLogin,
  adminChangePassword,
  createAdmin,
  createSuperAdmin,
  retrieveAllAdminAccounts,
  updateAdminAccount,
  deleteAdminAccount,
} = require('../database/Operations/Admin');

// // API endpoint
// router.get('/', (req, res) => {
//   res.send('Admin API endpoint');
// });

/*
  Endpoint: POST /admin/login
  Content type: JSON { email: 'string', password: 'string'}
  Return: Models.Admin object 
*/
router.post('/adminLogin', async (req, res) => {
  try {
    const credentials = req.body;
    const admin = await adminLogin(credentials.email, credentials.password);

    if (!admin) {
      // login failed, either email or password wrong
      res.status(401).json({message: 'Incorrect Email or Password'});
    } else {
      res.json(admin);
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: GET /admins/:adminId
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin object 
-------------------------------- */
router.get('/:adminId', async (req, res) => {
  try {
    // Can consider use req.body.id
    const adminId = req.params.adminId;

    /** If got errors, can try remove "currentAdmin =" to "currentAdmin.retrieveAdminByAdminId" */
    currentAdmin = await retrieveAdminByAdminId(adminId)
      .then((admin) => {
        res.json(admin);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error retrieving Admin by Id: ' + adminId,
        });
      });
  } catch (e) {
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: GET /admins/:email
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin object 
-------------------------------- */
router.get('/:email', async (req, res) => {
  try {
    const adminEmail = req.body.email;

    currentAdmin = await retrieveAdminByEmail(adminEmail)
      .then((admin) => {
        res.json(admin);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error retrieving Admin by Email: ' + adminEmail,
        });
      });
  } catch (e) {
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: GET /admins
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin objects 
-------------------------------- */
router.get('/getAdmins', async (req, res) => {
  try {
    currentAdmin = await retrieveAllAdminAccounts()
      .then((adminAccounts) => {
        res.json(adminAccounts);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error retrieving Admin Accounts!',
        });
      });
  } catch (e) {
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: POST /admins/createAdmin
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin object 
-------------------------------- */
router.post('/createAdmin', async (req, res) => {
  try {
    const newAdminCredentials = req.body;
    const newAdmin = await createAdmin(
      newAdminCredentials.name,
      newAdminCredentials.email,
      newAdminCredentials.password,
      newAdminCredentials.adminType
    );

    if (!newAdmin) {
      throw 'Admin is null, Admin creation failed';
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

/* --------------------------------
  Endpoint: PUT /admins/:adminId
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin object 
-------------------------------- */
router.put('/:adminId', async (req, res) => {
  try {
    const updatedAdmin = req.body;
    const adminId = updatedAdmin.adminId;

    currentAdmin = await updateAdminAccount(
      adminId,
      updatedAdmin.name,
      updatedAdmin.email,
      updatedAdmin.adminType
    )
      .then((updatedAdminAcc) => {
        res.json(updatedAdminAcc);
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error updating Admin by Id: ' + adminId,
        });
      });
  } catch (e) {
    res.status(500).json(e);
  }
});

/* --------------------------------
  Endpoint: DELETE /admins/:adminId
  Content type: JSON { adminId: 'UUID', name: 'string, email: 'string', password: 'string', adminType: "String"}
  Return: Models.Admin object 
-------------------------------- */
router.delete('/:adminId', async (req, res) => {
  try {
    const adminId = req.body.adminId;

    currentAdmin = await deleteAdminAccount(adminId)
      .then(() => {
        res.status(200).json({
          message: 'Successfully deleted admin with id = ' + adminId,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error deleting Admin by Id: ' + adminId,
        });
      });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
