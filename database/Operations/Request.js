const {Request} = require('../Models/Requst');
const REQUEST_STATUS = require('../../enum/RequestStatus');
const {Sequelize} = require('sequelize');

/*
Create a request tagged to an announcement
*/
const createRequest = async (userId, requestId, title, description, amount) => {
  try {
    const newRequest = Request.build({
      userId: userId,
      requestId: requestId,
      title: title,
      description: description,
      amount: amount,
      requestStatus: REQUEST_STATUS.PENDING, //Start of a request
    });

    return newRequest;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createRequest,
};
