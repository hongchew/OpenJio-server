const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  retrieveTicketByTicketId,
  retrieveAllTicketsByUserId,
  retrieveAllActiveTicketsByUserId,
  retrieveAllActiveTickets,
  updateTicket,
  resolveTicket,
  rejectTicket,
  deleteTicketByTicketId
} = require('../database/Operations/SupportTicket');

/* http://localhost:3000/supportTickets/ . */
router.get('/', (req, res) => {
  res.send('SupportTickets API endpoint ');
});

/* ----------------------------------------
  Create a new support ticket
  Endpoint: POST /supportTickets/create-ticket
  Body: JSON 
  {
    "title": "string",
    "description": "string",
    "supportType": "string", 
    "userId": "string"
  }
  Return: Model.SupportTicket object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-ticket', async (req, res) => {
  try {
    const newTicket = await createSupportTicket(
      req.body.title,
      req.body.description,
      req.body.supportType,
      req.body.userId,
    );
    res.json(newTicket);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of 1 support ticket by supportTicketId
  Endpoint: GET /supportTickets/ticket-info/:supportTicketId
  Parameters: supportTicketId
  Return: JSON of support ticket
  Status: Passed postman test
---------------------------------------- */
router.get('/ticket-info/:supportTicketId', async (req, res) => {
  try {
    const ticket = await retrieveTicketByTicketId(
      req.params.supportTicketId
    );
    res.status(200).json(ticket);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all support tickets from a user
  Endpoint: GET /supportTickets/tickets-by/:userId
  Params: userId 
  Return: JSON array of SupportTicket
  Status: Passed postman test
---------------------------------------- */
router.get('/tickets-by/:userId', async (req, res) => {
  try {
    const tickets = await retrieveAllTicketsByUserId(
      req.params.userId
    );
    res.status(200).json(tickets);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all ACTIVE(pending) support tickets from a user
  Endpoint: GET /supportTickets/active-tickets-by/:userId
  Params: userId 
  Return: JSON array of SupportTicket
  Status: Passed postman test
---------------------------------------- */
router.get('/active-tickets-by/:userId', async (req, res) => {
  try {
    const activeTickets = await retrieveAllActiveTicketsByUserId(
      req.params.userId
    );
    res.status(200).json(activeTickets);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all active(pending) support tickets - used for admin panel display
  Endpoint: GET /supportTickets/active-tickets-by/:userId
  Params: userId 
  Return: JSON array of SupportTicket
  Status: Pass postman test
---------------------------------------- */
router.get('/active-tickets', async (req, res) => {
  try {
    const activeTickets = await retrieveAllActiveTickets();
    res.status(200).json(activeTickets);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Update details of a support ticket (except supportStatus) by passing in an updated SupportTicket object
  Endpoint: PUT /supportTickets/update-ticket
  Body: SupportTicket object to update the database
  Return: SupportTicket object with updated fields
  Status: Passed postman test
---------------------------------------- */
router.put('/update-ticket', async (req, res) => {
  try {
    const updatedTicket = await updateTicket(req.body);
    res.status(200).json(updatedTicket);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Set the status of a support ticket to resolved
  Endpoint: PUT /supportTickets/resolve/:supportTicketId
  Parameters: supportTicketId
  Return: Resolved SupportTicket object
  Status: Passed postman test
---------------------------------------- */
router.put('/resolve/:supportTicketId', async (req, res) => {
  try {
    const ticket = await resolveTicket(req.params.supportTicketId);
    res.status(200).json(ticket);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Set the status of a support ticket to rejected
  Endpoint: PUT /supportTickets/reject/:supportTicketId
  Parameters: supportTicketId
  Return: Rejected SupportTicket object
  Status: Passed postman test
---------------------------------------- */
router.put('/reject/:supportTicketId', async (req, res) => {
  try {
    const ticket = await rejectTicket(req.params.supportTicketId);
    res.status(200).json(ticket);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Delete a support ticket via supportTicketId
  Endpoint: DELETE /delete/:supportTicketId
  Parameters: supportTicketId
  Return: Null
  Status: Passed postman test
---------------------------------------- */
router.delete('/delete/:supportTicketId', async (req, res) => {
    try {
      const ticket = await deleteTicketByTicketId(req.params.supportTicketId);
      res.status(200).send({
        status: true,
        message: 'Support ticket deleted',
      });
    } catch (e) {
      res.status(500).json(e);
    }
  });

module.exports = router;
