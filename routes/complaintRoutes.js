const express = require('express');
const router = express.Router();
const {
  createComplaint,
  retrieveAllComplaintsByRequestId,
  retrieveComplaintByComplaintId,
  updateComplaint,
  addResponse,
  resolveComplaint,
  rejectComplaint,
  deleteComplaintByComplaintId,
  retrieveAllPendingComplaints,
  strikeUserComplaint,
} = require('../database/Operations/Complaint');
const {strikeUser} = require('../database/Operations/User');

/* http://localhost:3000/complaints/ . */
router.get('/', (req, res) => {
  res.send('Complaints API endpoint ');
});

/* ----------------------------------------
  Create a new complaint
  Endpoint: POST /complaints/create-complaint
  Body: JSON 
  {
    "description": "string", 
    "requestId": "string", 
    complaintUserId :string
  }
  Return: Model.Complaint object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-complaint', async (req, res) => {
  try {
    const newComplaint = await createComplaint(
      req.body.description,
      req.body.requestId,
      req.body.complaintUserId
    );
    res.json(newComplaint);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Strike user in a complaint
  Endpoint: PUT /complaints/strike-user/
  Body: JSON {
    complaintUserId: string
    complaintId: string
  }
  Return: Model.Complaint object
  
---------------------------------------- */
router.put('/strike-user', async (req, res) => {
  try {
    await strikeUserComplaint(req.body.complaintUserId, req.body.complaintId);
    res.json({status: true});
  } catch (e) {
    res.status(500).json(e);
  }
});

//test
router.put('/strike/:userId', async (req, res) => {
  try {
    const user = await strikeUser(req.params.userId);
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all complaints of a particular request
  Endpoint: GET /complaints/all-complaints/:requestId
  Params: requestId 
  Return: JSON array of complaints
  Status: Passed postman test
---------------------------------------- */
router.get('/all-complaints/:requestId', async (req, res) => {
  try {
    const complaints = await retrieveAllComplaintsByRequestId(
      req.params.requestId
    );
    res.status(200).json(complaints);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all pending complaints
  Endpoint: GET /complaints/all-pending-complaints
  Params:  
  Return: JSON array of complaints
  Status: Passed postman test
---------------------------------------- */
router.get('/all-pending-complaints', async (req, res) => {
  try {
    const complaints = await retrieveAllPendingComplaints();
    res.status(200).json(complaints);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of 1 complaint by complaintId
  Endpoint: GET /complaints/complaint-info/:complaintId
  Parameters: complaintId
  Return: JSON of complaint
  Status: Passed postman test
---------------------------------------- */
router.get('/complaint-info/:complaintId', async (req, res) => {
  try {
    const complaint = await retrieveComplaintByComplaintId(
      req.params.complaintId
    );
    res.status(200).json(complaint);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Update users to details of a complaint by passing in an updated complaint object
  Endpoint: PUT /complaints/update-complaint
  Body: Complaint object to update the database
  Return: Complaint object with updated fields
  Status: Passed postman test
---------------------------------------- */
router.put('/update-complaint', async (req, res) => {
  try {
    const updatedComplaint = await updateComplaint(req.body);
    res.status(200).json(updatedComplaint);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  For admins to add a response to the complaints
  Endpoint: PUT /complaints/add-response
  Body: JSON 
  {
    "adminResponse": "string", 
    "complaintId": "string", 
  }
  Return: Complaint object with updated fields
  Status: Passed postman test
---------------------------------------- */
router.put('/add-response', async (req, res) => {
  try {
    const complaint = await addResponse(
      req.body.adminResponse,
      req.body.complaintId
    );
    res.status(200).json(complaint);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Set the status of a complain to resolved
  Endpoint: PUT /complaints/resolve/:complaintId
  Parameters: complaintId
  Return: Resolved complaint object
  Status: Passed postman test
---------------------------------------- */
router.put('/resolve/:complaintId', async (req, res) => {
  try {
    const complaint = await resolveComplaint(req.params.complaintId);
    res.status(200).json(complaint);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Set the status of a complain to rejected
  Endpoint: PUT /complaints/reject/:complaintId
  Parameters: complaintId
  Return: Rejected complaint object
  Status: Passed postman test
---------------------------------------- */
router.put('/reject/:complaintId', async (req, res) => {
  try {
    const complaint = await rejectComplaint(req.params.complaintId);
    res.status(200).json(complaint);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Delete a complaint via complaintId
  Endpoint: DELETE /complaints/delete/:complaintId
  Parameters: complaintId
  Return: Null
  Status: Passed postman test
---------------------------------------- */
router.delete('/delete/:complaintId', async (req, res) => {
  try {
    const complaint = await deleteComplaintByComplaintId(
      req.params.complaintId
    );
    res.status(200).send({
      status: true,
      message: 'Complaint deleted',
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
