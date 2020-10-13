const express = require('express');
const router = express.Router();
const {User} = require('../database/Models/User');

const {
  createUser,
  verifyUserLogin,
  changeUserPassword,
  resetUserPassword,
  verifyUserSingPass,
  updateUserDetails,
  retrieveAllUsers,
  retrieveAllUsersWithCovid,
  retrieveUserByUserId,
  verifyUserAccountCreation,
  giveBadge,
  retrieveLeaderboard,
  retrieveUserByEmail,
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
  Endpoint: GET /users/covid
  Content type: JSON { email: 'string', password: 'string' , name: 'string }
  Return: Array of all user objects with hasCovid: true
*/
router.get('/covid', async (req, res) => {
  try {
    const allUsersWCovid = await retrieveAllUsersWithCovid();
    res.status(200).json(allUsersWCovid);
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

    res.status(500).json(e);
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
      const avatarPath = `./files/${
        req.params.userId
      }_${new Date().getTime()}.${avatar.name.split('.').pop()}`;

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
        user: user,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

/*
  Accessed from email client/browser
  Endpoint: GET /users/verify-account-creation/:userId
  Content type: -
  Return: HTML
*/
router.get('/verify-account-creation/:userId', async (req, res) => {
  try {
    if (verifyUserAccountCreation(req.params.userId)) {
      res.status(200).send(`
      <h1>Account Validated</h1>
      <p> Please log in to the OpenJio App to enjoy the application! </p>
      <p> Remember to social distance and stay healthy! </p>
      `);
    } else {
      //verify account false
      res.status(401).send(`
      <h1>Account Validation Fail</h1>
      <p> Please check that the link is correct </p>
      `);
    }
  } catch (err) {
    res.status(500).send(`
      <h1>Unknown Error: 500</h1>
      <p> Please try again later</p>
    `);
  }
});

/*
  Endpoint: PUT /users/give-badge
  Content type: JSON { userId:'string', badgeType: 'string'}
  Return: true
*/
router.put('/give-badge/', async (req, res) => {
  try {
    const {userId, badgeType} = req.body;
    giveBadge(userId, badgeType)
      .then((resp) => {
        res.status(200).json(resp);
      })
      .catch((e) => {
        throw e;
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

/*
  Endpoint: GET /users/monthly-leaderboard
  Content type: -
  Return: Array of users with top 10 monthly badge count, including badges
*/

router.get('/monthly-leaderboard', async (req, res) => {
  try {
    const leaderboard = await retrieveLeaderboard('MONTHLY');
    res.json(leaderboard);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*
  Endpoint: GET /users/overall-leaderboard
  Content type: -
  Return: Array of users with top 10 overall badge count, including badges
*/

router.get('/overall-leaderboard', async (req, res) => {
  try {
    const leaderboard = await retrieveLeaderboard('TOTAL');
    res.json(leaderboard);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*
  KEEP THIS AT LAST PLACE TO PREVENT IT FROM PICKING UP OTHER HTTP GET CALLS
  Endpoint: GET /users/:email
  Content type: -
  Return: User object
*/
router.get('/:email', async (req, res) => {
  try {
    const user = await retrieveUserByEmail(req.params.email);
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  KEEP THIS AT LAST PLACE TO PREVENT IT FROM PICKING UP OTHER HTTP GET CALLS
  Endpoint: GET /users/:userId
  Content type: -
  Return: Array of all user objects
*/
router.get('/:userId', async (req, res) => {
  try {
    const user = await retrieveUserByUserId(req.params.userId);
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;
