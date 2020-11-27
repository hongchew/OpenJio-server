const express = require('express');
const router = express.Router();
const {
  createComment,
  retrieveCommentByCommentId,
  retrieve5MostRecentCommentsFromUsers,
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
    "adminId": "string",
    "supportTicketId": "string"
  }
  Return: Model.SupportComment object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-comment', async (req, res) => {
  try {
    const newComment = await createComment(
      req.body.description,
      req.body.isPostedByAdmin,
      req.body.adminId,
      req.body.supportTicketId
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
  Status: Passed postman test
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
  Status: Passed postman test
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
  Retrieve all support comments from *User* sorted by date (For admin notification)
  Endpoint: GET /supportComments/most-recent
  Params: (null)
  Return: JSON array of SupportComment
  Status: Passed postman test
---------------------------------------- */
router.get('/most-recent', async (req, res) => {
  try {
    const comments = await retrieve5MostRecentCommentsFromUsers();
    res.status(200).json(comments);
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
  Status: Passed postman test
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
  Status: Passed postman test
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
