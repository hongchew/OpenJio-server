const express = require('express');
const {Sequelize} = require('sequelize');


const {
  createTemperatureLog,
  retrieveTemperatureLogByTemperatureLogId,
  retrieveTemperatureLogsByUserId
} = require('../database/Operations/Temperature');

const router = express.Router();

/* http://localhost:3000/temperatures/ . */
router.get('/', (req, res) => {
  res.send('Temperature API endpoint ');
});

/* ----------------------------------------
  Create a new temperature log
  Endpoint: POST /temperatures/create-log
  Body: JSON {temperature: 'double', userId: 'string}
  Return: Model.TemperatureLog object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-log', async (req, res) => {
  try {
    const newTemperatureLog = await createTemperatureLog (
      req.body.userId,
      req.body.temperature,
      req.body.hasSymptoms,
      req.body.snhNotice, 
    )

    if (!newTemperatureLog) {
      throw 'Temperature log creation failed!';
    }
    res.json(newTemperatureLog);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all temperatures associated with a user
  Endpoint: GET /temperatures/by/:userId
  Parameters: userId
  Return: JSON array of temperature logs
  Status: Passed postman test
---------------------------------------- */
router.get('/all-temperature-log/:userId', async (req, res) => {
  try {
    const temperatureLogs = await retrieveTemperatureLogsByUserId(
      req.params.userId
    );
    res.status(200).json(temperatureLogs);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of a single temperature log by temperatureLogId
  Endpoint: GET /temperatures/by/:temperatureLogId
  Parameters: temperatureLogId
  Return: JSON of temperature log
  Status: Passed postman test
---------------------------------------- */
router.get('/by/:temperatureLogId', async (req, res) => {
  try {
    const temperatureLog = await retrieveTemperatureLogByTemperatureLogId(
      req.params.temperatureLogId
    );
    res.status(200).json(temperatureLog);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;