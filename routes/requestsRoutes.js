const express = require('express');
const {
  retrieveAllRequests,
  retrieveRequestById,
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

/* ----------------------------------------
    Retrieve details of a single announcement by announcementId
    Endpoint: GET /announcements/by/:userId
    Parameters: userId
    Return: JSON array of announcements
  ---------------------------------------- */
router.get('/by/:announcementId', async (req, res) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(
      req.params.announcementId
    );
    res.status(200).json(announcement);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
    Update details of an announcement by passing in an updated announcement object
    Endpoint: PUT /announcements/update-announcement
    Body: Announcement object to update the database
    Return: Announcement object with updated properties
  ---------------------------------------- */
router.put('/update-announcement', async (req, res) => {
  try {
    const updatedAnnouncement = await updateAnnouncement(req.body.announcement);
    res.status(200).json(updatedAnnouncement);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;
