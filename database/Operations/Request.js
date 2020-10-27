const {Request} = require('../Models/Requst');
const REQUEST_STATUS = require('../../enum/RequestStatus');
const {Sequelize} = require('sequelize');

/*
Create a request tagged to an announcement
Parameter: userid, requestId, title, description, amount
Return: Model.Request
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

/*
  Retrieve all requests
  Parameters: ()
  Return: Array of Model.Requests
*/
const retrieveAllRequests = async () => {
  try {
    const requests = await Request.findAll();
    return requests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all requests associated with given userId
  Parameters: (userId: string)
  Return: Array of Model.Request
*/
const retrieveAllRequestsByUserId = async (userId) => {
  try {
    const requests = await Request.findAll({
      where: {userId: userId},
    });
    return requests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Find and retrieve request from database with requestId
  Parameters: (requestId: string)
  Return: Model.Requst
*/
const retrieveRequestById = async (requestId) => {
  try {
    const request = await Request.findOne({
      where: {
        requestId: requestId,
      },
    });
    return request;
  } catch (e) {
    throw console.error(e);
  }
};

/* ----------------------------------------
  Delete Request
  Parameters: (requestId: UUID)
  Return: null
----------------------------------------*/
const deleteRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);

    if (!request) {
      throw 'Request with ' + requestId + ' does not exist';
    }

    const deletedRequest = await admin.destroy();

    if (adminDeleted) {
      console.log('Request deleted!');
      return null;
    }
  } catch (e) {
    throw console.error(e);
  }
};

module.exports = {
  createRequest,
  retrieveAllRequests,
  retrieveAllRequestsByUserId,
  retrieveRequestById,
  deleteRequest,
};
