const express = require('express');
const router = express.Router();
const {
  createComment,
  retrieveCommentByCommentId,
  retrieveAllCommentsByTicketId,
  updateComment,
  deleteCommentByCommentId
} = require('../database/Operations/SupportComment');

/* http://localhost:3000/supportComments/ . */
router.get('/', (req, res) => {
  res.send('SupportComments API endpoint ');
});

/* ----------------------------------------
  Create a new SupportComment
  Endpoint: POST /supportComments/create-comment
  Body: JSON 
  {
    "description": "string",
    "isPostedByAdmin": "boolean", 
    "adminId": "string"
  }
  Return: Model.SupportComment object
  Status:
---------------------------------------- */
router.post('/create-comment', async (req, res) => {
  try {
    const newComment = await createComment(
      req.body.description,
      req.body.isPostedByAdmin,
      req.body.adminId,
    );
    res.json(newComment);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of 1 SupportComment by supportCommentId
  Endpoint: GET /supportComments/comment-info/:supportCommentId
  Parameters: supportCommentId
  Return: SupportComment obhect
  Status:
---------------------------------------- */
router.get('/comment-info/:supportCommentId', async (req, res) => {
  try {
    const comment = await retrieveCommentByCommentId(
      req.params.supportCommentId
    );
    res.status(200).json(comment);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all SupportComments of a SupportTicket
  Endpoint: GET /supportComments/comments-by/:supportTicketId
  Params: supportTicketId
  Return: JSON array of SupportComment
  Status:
---------------------------------------- */
router.get('/comments-by/:supportTicketId', async (req, res) => {
  try {
    const comments = await retrieveAllCommentsByTicketId(
      req.params.supportTicketId
    );
    res.status(200).json(comments);
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
  Update details of SupportComment by passing in an updated SupportComment object
  Endpoint: PUT /supportComments/update-comment
  Body: SupportComment object to update the database
  Return: SupportComment object with updated fields
  Status:
---------------------------------------- */
router.put('/update-comment', async (req, res) => {
  try {
    const updatedComment = await updateComment(req.body);
    res.status(200).json(updatedComment);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Delete a SupportComment via supportCommentId
  Endpoint: DELETE /delete/:supportCommentId
  Parameters: supportCommentId
  Return: JSON array of the remainder SupportComments of a SupportTicket
  Status:
---------------------------------------- */
router.delete('/delete/:supportCommentId', async (req, res) => {
    try {
      const comments = await deleteCommentByCommentId(req.params.supportCommentId);
      res.status(200).json(comments);
    } catch (e) {
      res.status(500).json(e);
    }
  });

module.exports = router;
