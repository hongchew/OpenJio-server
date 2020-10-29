const express = require('express');
const {
  retrieveAllRequests,
  retrieveRequestById,
  updateRequest,
  deleteRequest,
  verifyRequest,
  rejectRequest,
  scheduleRequest,
  doingRequest,
  completeRequest,
  createRequest,
  retrieveAllRequestsByUserId,
  retrieveAllRequestsByAnnouncementId,
} = require('../database/Operations/Request');
const router = express.Router();

/* http://localhost:3000/requests/ . */
router.get('/', (req, res) => {
  res.send('requests API endpoint ');
});

/* --------------------------------
  Endpoint: GET /requests/retrieve-all
  Content type:
  Return: Models.Request objects 
  Tested and working
-------------------------------- */
router.get('/retrieve-all', async (req, res) => {
  try {
    const requests = await retrieveAllRequests();
    res.status(200).json(requests);
  } catch (e) {
    res.status(500).json({
      message: 'Error retrieving Requests!',
    });
  }
});

/* --------------------------------
    Get Request by requestId
    Endpoint: GET /requests/retrieve
    Content type: JSON { requestId: 'UUID'}
    Return: Array of Models.Request objects 
    Tested and working
  -------------------------------- */
router.get('/retrieve', async (req, res) => {
  try {
    const request = await retrieveRequestById(req.body.requestId);
    res.status(200).json(request);
  } catch (e) {
    res.status(500).json({
      message: 'Error retrieving request ' + req.body.requestId,
    });
  }
});

/* --------------------------------
    Get Request by UserId
    Endpoint: GET /requests/by-userId/:userId
    Parameters: userId
    Return: Array of Models.Request objects 
    Tested and working
  -------------------------------- */
router.get('/by-userId/:userId', async (req, res) => {
  try {
    const request = await retrieveAllRequestsByUserId(req.params.userId);
    res.status(200).json(request);
  } catch (e) {
    res.status(500).json({
      message:
        'Error retrieving request from user with userid' + req.body.userId,
    });
  }
});

/* --------------------------------
    Get Request by AnnouncementId
    Endpoint: GET /requests/by-announcementId/:announcementId
    Parameters: annoucementId
    Return: Array of Models.Request objects 
    Tested and working
  -------------------------------- */
router.get('/by-announcementId/:announcementId', async (req, res) => {
  try {
    const request = await retrieveAllRequestsByAnnouncementId(
      req.params.announcementId
    );
    res.status(200).json(request);
  } catch (e) {
    res.status(500).json({
      message:
        'Error retrieving request from announcement with announcementId' +
        req.body.announcementId,
    });
  }
});

/*
  Endpoint: PUT /requests/update-request
  Content type: JSON Model.Request {
    requestId: string,
    title, string,
    description: string,
    amount: double,
    //request status should not be updated with this method
    //expose this method only to requester
  } * only requestId is compulsory, every other field can be on a need-to-update basis.
  Return: Model.Request object with updated properties
  Tested and working
*/
router.put('/update-request', async (req, res) => {
  try {
    const updatedRequest = await updateRequest(req.body);
    res.status(200).json(updatedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/delete-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON status
  Tested and working
*/
router.put('/delete-request', async (req, res) => {
  try {
    await deleteRequest(req.body.requestId);
    res.status(200).send({
      status: true,
      message: 'Requested deleted',
    });
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/verify-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON Request Object with updated status
  Tested and working
*/
router.put('/verify-request', async (req, res) => {
  try {
    const verifiedRequest = await verifyRequest(req.body.requestId);
    res.status(200).json(verifiedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/reject-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON Request Object with updated status
  Tested and working
*/
router.put('/reject-request', async (req, res) => {
  try {
    const rejectedRequest = await rejectRequest(req.body.requestId);
    res.status(200).json(rejectedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/schedule-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON Request Object with updated status
  Tested and working
*/
router.put('/schedule-request', async (req, res) => {
  try {
    const scheduledRequest = await scheduleRequest(req.body.requestId);
    res.status(200).json(scheduledRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/doing-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON Request Object with updated status
  Tested and working
*/
router.put('/doing-request', async (req, res) => {
  try {
    const requestDoing = await doingRequest(req.body.requestId);
    res.status(200).json(requestDoing);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /requests/complete-request
  Content type: JSON {
    requestId: string, 
  }
  Return: JSON Request Object with updated status
  Tested and working
*/
router.put('/complete-request', async (req, res) => {
  try {
    const completedRequest = await completeRequest(req.body.requestId);
    res.status(200).json(completedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Create a new request
  Endpoint: POST /requests/create-request
  Body: JSON {userId: 'string', announcementId: 'string', description: 'string', title: 'string', amount: double}
  Return: Model.Request object
  Tested and working
---------------------------------------- */
router.post('/create-request', async (req, res) => {
  try {
    const newRequest = await createRequest(
      req.body.announcementId,
      req.body.userId,
      req.body.title,
      req.body.description,
      req.body.amount
    );

    if (!newRequest) {
      throw 'New Request creation failed!';
    }
    res.status(200).json(newRequest);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
