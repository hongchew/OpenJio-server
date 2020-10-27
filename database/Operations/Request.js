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

    if (deletedRequest) {
      console.log('Request deleted!');
      return null;
    }
  } catch (e) {
    throw console.error(e);
  }
};

/*
  Update Request Details
  Parameters: (Request: object {
    requestId, string,
    title: string,
    description: string,
    amount: double
  })
  Return: Request object
*/
const updateRequest = async (request) => {
  try {
    const requestToUpdate = await retrieveRequestById(request.requestId);
    if (!requestToUpdate) {
      throw 'User not found';
    }
    const updatedRequest = await requestToUpdate.update(request);
    return await retrieveRequestById(updatedRequest.requestId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
REQUESTER verify request
Parameters: requestId
Return: Request Object
*/
const verifyRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);
    request.verifyRequest();
    await request.save();
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
ANNOUNCER reject request
Parameters: requestId
Return: Request Object
*/
const rejectRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);
    request.rejectRequest();
    await request.save();
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
ANNOUNCER schedule request
Parameters: requestId
Return: Request Object
*/
const scheduleRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);
    request.scheduleRequest();
    await request.save();
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
ANNOUNCER doing request
Parameters: requestId
Return: Request Object
*/
const doingRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);
    request.doingRequest();
    await request.save();
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
ANNOUNCER complete request
Parameters: requestId
Return: Request Object
*/
const completeRequest = async (requestId) => {
  try {
    const request = await retrieveRequestById(requestId);
    request.completeRequest();
    await request.save();
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createRequest,
  retrieveAllRequests,
  retrieveAllRequestsByUserId,
  retrieveRequestById,
  deleteRequest,
  updateRequest,
  verifyRequest,
  rejectRequest,
  scheduleRequest,
  doingRequest,
  completeRequest,
};
