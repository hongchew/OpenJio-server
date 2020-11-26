const {OutbreakZone} = require('../Models/OutbreakZone');

/* ----------------------------------------
  Create an outbreak zone object
  Parameters: (postalcode, userId)
  Return: Temperature log object
---------------------------------------- */
const createOutbreakZone = async (postalCode) => {
  try {
    const newOutbreakZone = OutbreakZone.build({
      postalCode: postalCode,
    });

    await newOutbreakZone.save();
    
    return newOutbreakZone;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createOutbreakZone,
};
