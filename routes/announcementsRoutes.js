const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  retrieveNearbyAnnouncements,
  retrieveAllAnnouncements,
  retrieveAllAnnouncementsByUserId,
  retrieveAllRequestsForAnnouncement,
  retrieveAnnouncementByAnnouncementId,
  updateAnnouncement,
  deleteAnnouncementByAnnouncementId,
  ongoingAnnouncement,
  pastAnnouncement,
  activeAnnouncement,
  completedAnnouncement,
  retrieveUserAnnouncementsTwoWeeks
} = require('../database/Operations/Announcement');

/* http://localhost:3000/announcements/ . */
router.get('/', (req, res) => {
  res.send('Announcements API endpoint ');
});

/* ----------------------------------------
  Create a new announcement
  Endpoint: POST /announcements/create-announcement
  Body: JSON {userId: 'string', addressId: 'string', description: 'string', closeTime: 'string', destination: 'string'}
  Return: Model.Announcement object
  Status: Passed postman test
---------------------------------------- */
router.post('/create-announcement', async (req, res) => {
  try {
    const newAnnouncement = await createAnnouncement(
      req.body.userId,
      req.body.addressId,
      req.body.description,
      req.body.closeTime,
      req.body.destination
    );

    if (!newAnnouncement) {
      throw 'Announcement creation failed!';
    }
    res.json(newAnnouncement);
  } catch (e) {
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all active announcements in a 100m radius
  Endpoint: GET /announcements/nearby-announcements/:addressId
  Parameters: addressId
  Return: JSON array of active announcements within a 100m radius
  Status: Passed postman test
---------------------------------------- */
router.get('/nearby-announcements/:addressId', async (req, res) => {
    try {
      const announcements = await retrieveNearbyAnnouncements(req.params.addressId);
      res.status(200).json(announcements);
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  });

/* ----------------------------------------
  Retrieve all announcements irregardless of users and distance - probably for internal testing
  Endpoint: GET /announcements/view-all-announcements
  Parameters: Null
  Return: JSON array of announcements
  Status: Passed postman test
---------------------------------------- */
router.get('/view-all-announcements', async (req, res) => {
  try {
    const announcements = await retrieveAllAnnouncements();
    res.status(200).json(announcements);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all announcements listed by a userId
  Endpoint: GET /all-announcements/:userId
  Parameters: userId
  Return: JSON array of announcements
  Status: Passed postman test
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
  Retrieve all announcements listed by a userId in the past 2 weeks
  Endpoint: GET /two-weeks/:userId
  Parameters: userId
  Return: JSON array of announcements
  Status: Passed postman test
---------------------------------------- */
router.get('/two-weeks/:userId', async (req, res) => {
  try {
    const announcements = await retrieveUserAnnouncementsTwoWeeks(
      req.params.userId
    );
    res.status(200).json(announcements);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve all requests associated with an announcement
  Endpoint: GET /all-requests/:announcementId
  Parameters: announcementId
  Return: JSON array of requests
  Status: Passed postman test
---------------------------------------- */
router.get('/all-requests/:announcementId', async (req, res) => {
  try {
    const requests = await retrieveAllRequestsForAnnouncement(
      req.params.announcementId
    );
    res.status(200).json(requests);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Retrieve details of a single announcement by announcementId
  Endpoint: GET /announcements/by/:announcementId
  Parameters: announcementId
  Return: JSON of announcement
  Status: Passed postman test
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
  Status: Passed postman test
---------------------------------------- */
router.put('/update-announcement', async (req, res) => {
  try {
    const updatedAnnouncement = await updateAnnouncement(req.body);
    res.status(200).json(updatedAnnouncement);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/* ----------------------------------------
  Delete an announcement via announcementId
  Endpoint: DELETE /announcements/by/:announcementId
  Parameters: announcementId
  Return: Null
  Status: Passed postman test
---------------------------------------- */
router.delete('/by/:announcementId', async (req, res) => {
    try {
      const announcement = await deleteAnnouncementByAnnouncementId(req.params.announcementId);
      res.status(200).json(announcement);
    } catch (e) {
      res.status(500).json(e);
    }
  });

  /* ----------------------------------------
  Set announcement as ONGOING via announcementId
  Endpoint: PUT /announcements/ongoing-announcement/:announcementId
  Parameters: announcementId
  Return: Announcement
  Status: Passed postman test
  Purpose: Mainly for postman testing
---------------------------------------- */
router.put('/ongoing-announcement/:announcementId', async (req, res) => {
  try {
    const announcementOngoing = await ongoingAnnouncement(req.params.announcementId);
    res.status(200).json(announcementOngoing);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

  /* ----------------------------------------
  Set announcement as PAST via announcementId
  Endpoint: PUT /announcements/past-announcement/:announcementId
  Parameters: announcementId
  Return: Announcement
  Status: Passed postman test
  Purpose: Mainly for postman testing
---------------------------------------- */
router.put('/past-announcement/:announcementId', async (req, res) => {
  try {
    const announcementPast = await pastAnnouncement(req.params.announcementId);
    res.status(200).json(announcementPast);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

  /* ----------------------------------------
  Set announcement as ACTIVE via announcementId
  Endpoint: PUT /announcements/activate-announcement/:announcementId
  Parameters: announcementId
  Return: Announcement
  Status: Passed postman test
  Purpose: Mainly for postman testing
---------------------------------------- */
router.put('/activate-announcement/:announcementId', async (req, res) => {
  try {
    const announcementActivated = await activeAnnouncement(req.params.announcementId);
    res.status(200).json(announcementActivated);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

 /* ----------------------------------------
  Set announcement as COMPLETED via announcementId
  Endpoint: PUT /announcements/complete-announcement/:announcementId
  Parameters: announcementId
  Return: Announcement
  Status: Passed postman test
  Purpose: Mainly for postman testing
---------------------------------------- */
router.put('/complete-announcement/:announcementId', async (req, res) => {
  try {
    const announcementCompleted = await completedAnnouncement(req.params.announcementId);
    res.status(200).json(announcementCompleted);
  } catch (e) {
    //generic server error
    res.status(500).json(e);
  }
});

module.exports = router;
