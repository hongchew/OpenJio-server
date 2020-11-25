const TEMPERATURE_RISK_LEVEL = require('../../enum/TemperatureRiskLevel');
const {TemperatureLog} = require('../Models/TemperatureLog');
const {updateUserDetails} = require('./User');

/* ----------------------------------------
  Create a health log
  Parameters: (temperature, userId)
  Return: Temperature log object
---------------------------------------- */
const createTemperatureLog = async (
  userId,
  temperature,
  hasSymptoms, 
  snhNotice
) => {
  try {
    //To check for high risk
    const isHighRisk = (hasSymptoms || snhNotice || temperature > 37.5) ? true : false;

    const newTempLog = TemperatureLog.build({
      temperature: temperature,
      userId: userId,
    });

    const updateUser = await updateUserDetails({
      userId: userId,
      isHighRisk: isHighRisk
    })

    await newTempLog.save();
    await updateUser.save();

    return updateUser;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve one temperature log by temperatureLogId
  Parameters: temperatureLogId
  Return: 1 temperatureLog object
---------------------------------------- */
const retrieveTemperatureLogByTemperatureLogId = async (temperatureLogId) => {
  try {
    const temperatureLog = await TemperatureLog.findOne({ 
      where: { 
        temperatureLogId: temperatureLogId 
      } 
    });
    return temperatureLog;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all temperature logs associated with a user
  Parameters: userId
  Return: Array of temperature log objects
---------------------------------------- */
const retrieveTemperatureLogsByUserId = async (userId) => {
  try {
    const temperatureLogs = await TemperatureLog.findAll({ 
      where: { 
        userId: userId
      } 
    });
    return temperatureLogs;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createTemperatureLog,
  retrieveTemperatureLogByTemperatureLogId,
  retrieveTemperatureLogsByUserId
};