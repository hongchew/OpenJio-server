const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    retrieveAllAnnouncements,
    retrieveAnnouncementByUserId,
    retrieveAllAnnouncementsByUserId,
    retrieveAnnouncementByAnnouncementId,
    updateAnnouncement
  } = require('../database/Operations/Announcement');

/* http://localhost:3000/announcements/ . */
router.get('/', (req, res) => {
  res.send('announcements API endpoint ');
});

/* ----------------------------------------
  Retrieve all announcements listed by a userId
  Endpoint: GET /announcements/by/:userId
  Parameters: userId
  Return: JSON array of announcements
---------------------------------------- */
router.get('/all-announcements/:userId', async (req, res) => {
  try {
    const announcements = await retrieveAllAnnouncementsByUserId(
      req.params.userId
    );
    res.status(200).json(announcements);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
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
