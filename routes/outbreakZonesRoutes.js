const express = require('express');
const {Sequelize} = require('sequelize');
const { sendOutbreakNotification } = require('../database/Operations/Notifications');


const {
  createOutbreakZone,
} = require('../database/Operations/OutbreakZone');

const router = express.Router();

/* http://localhost:3000/outbreakzones/ . */
router.get('/', (req, res) => {
  res.send('Temperature API endpoint ');
});

/* ----------------------------------------
  Create a new outbreak zone
  Endpoint: POST /outbreakzones/create-outbreakzone
  Body: JSON {postalCode: 'double'}
  Return: Model.OutbreakZone object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-outbreakzone', async (req, res) => {
  try {
    const newOutbreakZone = await createOutbreakZone (
      req.body.postalCode,
    )

    if (!newOutbreakZone) {
      throw 'Outbreak zone creation failed!';
    }

    await sendOutbreakNotification(newOutbreakZone);

    res.json(newOutbreakZone);
  } catch (e) {
    console.log(e)
    res.status(500).json(e);
  }
});



module.exports = router;