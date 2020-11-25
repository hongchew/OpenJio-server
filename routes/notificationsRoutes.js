const express = require('express');
const router = express.Router();

const {
  deleteNotification,
  getAllNotificationsByUserId,
  markNotificationAsRead,
} = require('../database/Operations/Notifications');

/*
  Endpoint: GET /notifications/userId/:userId
  Content type: -
  Return: Array of Notifications belonging to user with userId
*/
router.get('/userId/:userId', async (req, res) => {
  try {
    const notifs = await getAllNotificationsByUserId(req.params.userId);
    res.status(200).json(notifs);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: PUT /notifications/read/:notifId
  Content type: -
  Return: Mark notification as read 
*/
router.put('/read/:notifId', (req, res) => {
  try {
    markNotificationAsRead(req.params.notifId)
      .then(res.status(200).send(true))
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

/*
  Endpoint: DEL /notifications/:notifId
  Content type: -
  Return: Dismiss/delete notification 
*/
router.delete('/:notifId', async (req, res) => {
  try {
    const success = await deleteNotification(req.params.notifId);
    if (success) {
      res.status(200).send(true);
    } else {
      res.status(500).send(false);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

module.exports = router;
