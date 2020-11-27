const {Request} = require('../Models/Request');
const {Announcement} = require('../Models/Announcement');
const {sendNotification} = require('./Notifications');
const {Op} = require('sequelize');
const {retrieveWalletByWalletId, retrieveWalletByUserId} = require('./Wallet');
const {retrieveUserByUserId} = require('./User');
const requestStatus = require('../../enum/RequestStatus');
const announcementStatus = require('../../enum/AnnouncementStatus');
const {retrieveAnnouncementByAnnouncementId} = require('./Announcement');

/*
  Create a Request between announcer and requester
  Parameters: (title, description, amount, announcementId, userId)
  Return: Request Object
*/
const createRequest = async (
  title,
  description,
  amount,
  announcementId,
  userId
) => {
  try {
    // Retrieve announcement from announcement Id - Check if announcement exists
    const announcement = await retrieveAnnouncementByAnnouncementId(
      announcementId
    );
    if (!announcement) {
      throw 'Announcement with ID: ' + announcementId + ' not found';
    }

    // Check if the announcement is still open
    if (announcement.announcementStatus === announcementStatus.PAST) {
      throw `Announcement with ID: ${announcementId} has already been closed`;
    }

    // Retrieve user from user id - Check if user (requester) exists
    const requester = await retrieveUserByUserId(userId);
    if (!requester) {
      throw 'Requester with User ID: ' + userId + ' not found';
    }

    // Retrieve user's wallet to check if he has sufficient wallet balance to make the request
    const requesterWallet = await retrieveWalletByUserId(userId);
    if (requesterWallet.balance < amount) {
      throw 'Insufficient wallet balance to submit request, please top up your wallet balance and try again';
    }

    const newRequest = Request.build({
      title: title,
      description: description,
      amount: amount,
    });

    // Associating request to announcement
    newRequest.announcementId = announcementId;

    // Associating requester to user (requester)
    newRequest.userId = userId;

    await newRequest.save();

    const notiTitle = `New Request: ${title}`;
    const notiContent = `${description}`;
    await sendNotification(announcement.userId, notiTitle, notiContent);

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
  Retrieve all requests by requester based on userId
  Parameters: (userId: UUID)
  Return: Array of Request
*/
const retrieveAllRequestsByUserId = async (userId) => {
  try {
    const requests = await Request.findAll({
      where: {
        userId: userId,
      },
    });
    return requests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all requests by requester based on userId
  Parameters: (userId: UUID)
  Return: Array of Request
*/
const retrieveAllRequestsWithAnnouncementByUserId = async (userId) => {
  try {
    const requestsWithAnnouncement = await Request.findAll({
      where: {
        userId: userId,
      },
      include:[{
        model: Announcement,
        attributes: ['announcementId', 'startLocation', 'destination', 'createdAt'],
      }]
    });
    return requestsWithAnnouncement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*  
Retrieve all ongoing requests by requester based on userId that are not COMPLETED & VERIFIED
Parameters: (userId: UUID)
Return: Array of Request
*/

const retrieveAllOngoingRequests = async (userId) => {
  try {
    const ongoingRequests = await Request.findAll({
      where: {
        userId: userId,
        requestStatus: {
          [Op.not]: [requestStatus.VERIFIED, requestStatus.REJECTED],
        },
      },
    });
    return ongoingRequests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all requests by requester based on userId that are COMPLETED & VERIFIED
  Parameters: (userId: UUID)
  Return: Array of Request
*/
const retrieveAllPastRequests = async (userId) => {
  try {
    const pastRequests = await Request.findAll({
      where: {
        userId: userId,
        requestStatus: {
          [Op.or]: [requestStatus.COMPLETED, requestStatus.VERIFIED],
        },
      },
    });
    return pastRequests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all requests by requester based on userId that are REJECTED
  Parameters: (userId: UUID)
  Return: Array of Request
*/
const retrieveAllRejectedRequests = async (userId) => {
  try {
    const rejectedRequests = await Request.findAll({
      where: {
        userId: userId,
        requestStatus: requestStatus.REJECTED,
      },
    });
    return rejectedRequests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all requests for an announcement that are not made by the same person
  Parameters: (announcementId: string)
  Return: Array of Model.Request
*/
const retrieveAllRequestsByAnnouncementId = async (announcementId) => {
  try {
    const requests = await Request.findAll({
      where: {announcementId: announcementId},
    });

    //to filter out any potential requests that are made on announcement by the same person
    const announcement = await retrieveAnnouncementByAnnouncementId(
      announcementId
    );
    const filteredRequests = requests.filter(
      (request) => request.userId !== announcement.userId
    );
    return filteredRequests;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* 
  Retrieve one request associated by requestId
  Parameters: (requestId: UUID)
  Return: Request Model
*/
const retrieveRequestByRequestId = async (requestId) => {
  try {
    const request = await Request.findOne({
      where: {
        requestId: requestId,
      },
    });
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Update ongoing request details
  Parameters: (request)
  Return: Request Model
  Status: 
*/
const updateRequest = async (request) => {
  try {
    const requestToUpdate = await retrieveRequestByRequestId(request.requestId);
    if (!requestToUpdate) {
      throw 'Request with ID ' + request.requestId + ' cannot be found!';
    }

    // Only can update ongoing request
    if (requestToUpdate.requestStatus !== requestStatus.PENDING) {
      throw 'Request is already accepted or rejected by the announcer!';
    }

    // Retrieve user's wallet to check if he has sufficient wallet balance to update the request
    // const requesterWallet = await retrieveWalletByUserId(request.userId);
    // if (requesterWallet.balance < requestToUpdate.amount) {
    //   throw 'Insufficient wallet balance to submit request, please top up your wallet balance and try again';
    // }

    const updatedRequest = await requestToUpdate.update(request);

    // Retrieving announcement to get the announcer's userId to send notification to
    const announcement = await retrieveAnnouncementByAnnouncementId(
      requestToUpdate.announcementId
    );

    const notiTitle = `Updated Request: ${requestToUpdate.title}`;
    const notiContent = `${requestToUpdate.description}`;
    await sendNotification(announcement.userId, notiTitle, notiContent);

    return await retrieveRequestByRequestId(updatedRequest.requestId);
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
    const request = await retrieveRequestByRequestId(requestId);
    request.verifyRequest();
    await request.save();
    await sendNotification(request.userId,
      'Thank you for using Openjio!',
    `Remember to verify the completion of your request to ${request.title} in My Activity!`)
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
    const request = await retrieveRequestByRequestId(requestId);
    request.rejectRequest();
    await request.save();
    await sendNotification(request.userId,
      'Someone save this child!',
    `Your requests submitted to ${request.title} has been rejected by the announcer. Please consider submitting requests for other announcements!`)
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
    const request = await retrieveRequestByRequestId(requestId);
    request.scheduleRequest();
    await request.save();
    await sendNotification(request.userId,
      'Hooray! Your request has been scheduled!',
    `A request that you have made to ${request.title} has been accpeted by another user and is scheduled to happen.`)
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
    const request = await retrieveRequestByRequestId(requestId);
    request.doingRequest();
    await request.save();
    await sendNotification(request.userId,
      'Hooray! Doing your request now!',
    `An OpenJio user will be doing your request to ${request.title} now!`)
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
    const request = await retrieveRequestByRequestId(requestId);
    request.completeRequest();
    await request.save();
    await sendNotification(request.userId,
      'Request completed!',
    `The announcer has just completed your request to ${request.title}!`)
    return request;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Delete request by request ID
  Parameters: (requestId: UUID)
  Return: Array of all addresses associated with the users
*/
const deleteRequestByRequestId = async (requestId) => {
  try {
    const request = await retrieveRequestByRequestId(requestId);
    if (!request) {
      throw 'Request with ID: ' + requestId + ' cannot be found!';
    }

    // Can only be deleted if status is Pending or Scheduled
    if (
      request.requestStatus === requestStatus.DOING ||
      request.requestStatus === requestStatus.COMPLETED ||
      request.requestStatus === requestStatus.VERIFIED
    ) {
      throw 'Request cannot be deleted because it is already accepted by announcer or completed!';
    }

    const userId = request.userId;
    const requestDeleted = await request.destroy();

    if (requestDeleted) {
      console.log('Request with ID: ' + requestId + ' successfully deleted!');
      return await retrieveAllRequestsByUserId(userId);
    } else {
      throw 'Failed to delete request with ID: ' + requestId;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createRequest,
  retrieveAllRequests,
  retrieveAllRequestsByUserId,
  retrieveAllRequestsWithAnnouncementByUserId,
  retrieveAllRequestsByAnnouncementId,
  retrieveAllOngoingRequests,
  retrieveAllPastRequests,
  retrieveAllRejectedRequests,
  retrieveRequestByRequestId,
  deleteRequestByRequestId,
  updateRequest,
  verifyRequest,
  rejectRequest,
  scheduleRequest,
  doingRequest,
  completeRequest,
};
