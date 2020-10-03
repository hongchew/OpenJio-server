const express = require('express');
const router = express.Router();
const {User} = require('../database/Models/User');

const {
  createUser,
  verifyUserLogin,
  changeUserPassword,
  sendEmail,
  resetUserPassword,
  verifyUserSingPass,
  updateUserDetails,
  retrieveAllUsers,
} = require('../database/Operations/User');

/*
  Endpoint: GET /users/
  Content type: -
  Return: Array of all user objects
*/
router.get('/', async (req, res) => {
  try {
    const allUsers = await retrieveAllUsers();
    res.status(200).json(allUsers);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
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
  Endpoint: PUT /users/change-user-password
  Content type: JSON { email: 'string', currPassword: 'string', newPassword: 'string'}
  Return: HTTP status code
*/
router.put('/change-user-password', async (req, res) => {
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
  Endpoint: PUT /users/reset-user-password
  Content type: JSON { email: 'string'}
  Return: HTTP status code
*/
router.put('/reset-user-password', async (req, res) => {
  try {
    await resetUserPassword(req.body.email);
    res.status(200).send();
  } catch (e) {
    // generic server error

    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /users/verify-user-singpass
  Content type: JSON { userId:'string', nric: 'string', singpassPassword: 'string'}
  Return: Model.User object with updated isSingPassVerified status
*/
router.put('/verify-user-singpass', async (req, res) => {
  try {
    const {userId, nric, singpassPassword} = req.body;
    /*
      ^[STFG]\d{7}[A-Z]$ is the REGEX for generic NRIC without caring for the validity of checksum
      NRIC structure: #0000000@, 
      # is S,T,F or G
      0000000 is a 7 digit number
      @ is a checksum from A-Z calculated based on # and 0000000 (validity ignored for this algorithm)
      src: https://en.wikipedia.org/wiki/National_Registration_Identity_Card
    */
    if (nric.match(/^[STFG]\d{7}[A-Z]$/)) {
      //valid nric
      const updatedUser = await verifyUserSingPass(userId);
      res.status(200).json(updatedUser);
    } else {
      res.status(401).send();
    }
  } catch (e) {
    // generic server error

    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /users/update-user-details
  Content type: JSON Model.User {
    userId: string,
    name: string,
    mobileNumber: string,
    email: string,
    isBlackListed: boolean,
    hasCovid: boolean,
    isSingPassVerified: boolean,
    strikeCount: number,
    avatarPath: string,
    defaultAddressId: string
  } * only userId is compulsory, every other field can be on a need-to-update basis.
  Return: Model.User object with updated properties
*/
router.put('/update-user-details', async (req, res) => {
  try {
    const updatedUser = await updateUserDetails(req.body);
    res.status(200).json(updatedUser);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: POST /users/upload-avatar/:userId
  Content type: form-data (file) { avatar }
  Return: JSON { status : boolean , message: string, avatarPath : string }
*/
router.post('/upload-avatar/:userId', async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.avatar;
      console.log(req.files);
      //Use the mv() method to place the file in files directory
      const avatarPath =
        './files/' + req.params.userId + '.' + avatar.name.split('.').pop();
      avatar.mv(avatarPath);

      const user = await updateUserDetails({
        userId: req.params.userId,
        avatarPath: avatarPath,
      });

      //send response
      res.status(200).send({
        status: true,
        message: 'File is uploaded',
        avatarPath: user.avatarPath,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
