const express = require('express');
const {
  createRequest,
  retrieveAllRequests,
  retrieveAllOngoingRequests,
  retrieveAllPastRequests,
  retrieveAllRequestsByUserId,
  retrieveRequestByRequestId,
  updateRequest,
  deleteRequestByRequestId,
  verifyRequest,
  rejectRequest,
  scheduleRequest,
  doingRequest,
  completeRequest,
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
  Status: Passed postman test
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

/* ----------------------------------------
  Retrieve details of a single request by requestId
  Endpoint: GET /requests/by-requestId/:requestId
  Parameters: requestId
  Return: JSON of request
  Status: Passed postman test
---------------------------------------- */
router.get('/by-requestId/:requestId', async (req, res) => {
  try {
    const request = await retrieveRequestByRequestId(req.params.requestId);
    res.status(200).json(request);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of all requests by userId
  Endpoint: GET /requests/by-userId/:userId
  Parameters: userId
  Return: Array of request objects
  Status: Passed postman test
---------------------------------------- */
router.get('/by-userId/:userId', async (req, res) => {
  try {
    const requests = await retrieveAllRequestsByUserId(req.params.userId);
    res.status(200).json(requests);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of all ongoing requests by userId
  Endpoint: GET /requests/ongoing/:userId
  Parameters: userId
  Return: Array of request objects
  Status: Passed postman test
---------------------------------------- */
router.get('/ongoing/:userId', async (req, res) => {
  try {
    const ongoingRequests = await retrieveAllOngoingRequests(req.params.userId);
    res.status(200).json(ongoingRequests);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of all past requests by userId
  Endpoint: GET /requests/past/:userId
  Parameters: userId
  Return: Array of request objects
  Status: Passed postman test
---------------------------------------- */
router.get('/past/:userId', async (req, res) => {
  try {
    const pastRequests = await retrieveAllPastRequests(req.params.userId);
    res.status(200).json(pastRequests);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message:
        'Error retrieving request from user with userid' + req.params.userId,
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
  Status: Passed postman test
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

/* ----------------------------------------
  Create a new request
  Endpoint: POST /requests/create-request
  Body: JSON {title: 'string', description: 'string', amount: 'string', announcementId: 'string', userId: 'string'}
  Return: Model.Request object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-request', async (req, res) => {
  try {
    const newRequest = await createRequest(
      req.body.title,
      req.body.description,
      req.body.amount,
      req.body.announcementId,
      req.body.userId
    );

    if (!newRequest) {
      throw 'Request creation failed!';
    }
    res.json(newRequest);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Delete a request via requestId
  Endpoint: DELETE /requests/delete/:requestId
  Parameters: requestId
  Return: Null
  Status: Passed postman test
---------------------------------------- */
router.delete('/delete/:requestId', async (req, res) => {
  try {
    const request = await deleteRequestByRequestId(req.params.requestId);
    res.status(200).send({
      status: true,
      message: 'Request deleted',
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Verify a request via requestId
  Endpoint: PUT /requests/verify-request/:requestId
  Parameters: requestId
  Return: Request
  Status: Passed postman test
---------------------------------------- */
router.put('/verify-request/:requestId', async (req, res) => {
  try {
    const verifiedRequest = await verifyRequest(req.params.requestId);
    res.status(200).json(verifiedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Reject a request via requestId
  Endpoint: PUT /requests/reject-request/:requestId
  Parameters: requestId
  Return: Request
  Status: Passed postman test
---------------------------------------- */
router.put('/reject-request/:requestId', async (req, res) => {
  try {
    const rejectedRequest = await rejectRequest(req.params.requestId);
    res.status(200).json(rejectedRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Schedule a request via requestId
  Endpoint: PUT /requests/schedule-request/:requestId
  Parameters: requestId
  Return: Request
  Status: Passed postman test
---------------------------------------- */
router.put('/schedule-request/:requestId', async (req, res) => {
  try {
    const scheduledRequest = await scheduleRequest(req.params.requestId);
    res.status(200).json(scheduledRequest);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Doing a request via requestId
  Endpoint: PUT /requests/doing-request/:requestId
  Parameters: requestId
  Return: Request
  Status: Passed postman test
---------------------------------------- */
router.put('/doing-request/:requestId', async (req, res) => {
  try {
    const requestDoing = await doingRequest(req.params.requestId);
    res.status(200).json(requestDoing);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Complete a request via requestId
  Endpoint: PUT /requests/complete-request/:requestId
  Parameters: requestId
  Return: Request
  Status: Passed postman test
---------------------------------------- */
router.put('/complete-request/:requestId', async (req, res) => {
  try {
    const completedRequest = await completeRequest(req.params.requestId);
    res.status(200).json(completedRequest);
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
