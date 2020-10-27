const TEMPERATURE_RISK_LEVEL = require('../../enum/TemperatureRiskLevel');
const {TemperatureLog} = require('../Models/TemperatureLog');

/* ----------------------------------------
  Create a health log
  Parameters: (temperature, userId)
  Return: Temperature log object
---------------------------------------- */
const createTemperatureLog = async (
  userId,
  temperature
) => {
  try {
    const risk = (temperature > 37.5) ? TEMPERATURE_RISK_LEVEL.HIGH_RISK : TEMPERATURE_RISK_LEVEL.LOW_RISK;

    const newTempLog = TemperatureLog.build({
      temperature: temperature,
      userId: userId,
      riskLevel: risk,
    });

    await newTempLog.save();
    return newTempLog;
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