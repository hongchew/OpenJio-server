const express = require('express');
const {
  retrieveAllRequests,
  retrieveRequestById,
  updateRequest,
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
    Endpoint: GET /requests/retrieve
    Content type: JSON { requestId: 'UUID'}
    Return: Array of Models.Request objects 
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

module.exports = router;
