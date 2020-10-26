const { get } = require('../../routes/adminRoutes');
const {Announcement} = require('../Models/Announcement');

/* ----------------------------------------
  ATTENTION: STILL A WORK IN PROGRESS UNTIL CLARIFICATIONS FOR startLocation AND destination
  Create an announcement tagged to a user
  Parameters: (userId, startLocation, description, closeTime)
  Return: Announcement object
---------------------------------------- */
const createAnnouncement = async (
  userId,
  startLocation,
  description,
  closeTime,
  destination
) => {
  try {
    const newAnnouncement = Announcement.build({
      userId: userId,
      announcementStatus: 'ACTIVE',
      description: description,
      closeTime: new Date (closeTime) //since it is returned to us in a JSON format
    });

    //Setting the timeout of the close time
    const now = new Date().getTime();
    var timeDiff = new Date(closeTime).getTime() - now;
    setTimeout(closeAnnouncement(announcementId), timeDiff);
    await newAnnouncement.save();

    return newAnnouncement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all announcements from the database without userId filter
  Parameters: Null
  Return: Array of announcement objects 
---------------------------------------- */
const retrieveAllAnnouncements = async () => {
  try {
    const announcements = await Announcement.findAll();
    return announcements;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all announcements associated with a user
  Parameters: userId
  Return: Array of announcement objects 
---------------------------------------- */
const retrieveAllAnnouncementsbyUserId = async (userId) => {
  try {
    const announcements = await Announcement.findAll({
      where: {
        userId: userId
      }
    });
    return announcements;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve a single announcement by userId - may be used for internal validations
  Parameters: userId
  Return: 1 announcement object
---------------------------------------- */
const retrieveAnnouncementByUserId = async (userId) => {
  try {
    const announcement = await Announcement.findOne({ 
      where: { 
        userId: userId 
      } 
    });
    return announcement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve a single announcement by announcementId
  Parameters: announcementId
  Return: 1 announcement object
---------------------------------------- */
const retrieveAnnouncementByAnnouncementId = async (announcementId) => {
  try {
    const announcement = await Announcement.findByPk(announcementId);
    return announcement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Close an announcement to PAST upon timeout
  Parameters: announcementId
  Return: Null
  Note: No need to export this function since it's a timeout function
---------------------------------------- */
const closeAnnouncement = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(announcementId);
    //Backend announcement validation
    if (!announcement) {
      throw `Announcement ${announcementId} not found!`;
    }
    const closedAnnouncement = announcement.disableAnnouncement();
    await closedAnnouncement.save();
    console.log(`AnnouncementID ${announcementId} is closed!`)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Update details of an announcement by passing in an updated announcement object
  Parameters: announcement object
  Return: announcement object
---------------------------------------- */
const updateAnnouncement = async (announcement) => {
  try {
    const announcementToUpdate = await retrieveAnnouncementByAnnouncementId(announcement.announcementId);
    //Backend announcement validation
    if (!announcementToUpdate) {
      throw `Announcement ${announcement.announcementId} not found!`;
    }
    const updatedAnnouncement = await announcementToUpdate.update(announcement);
    return await retrieveAnnouncementByAnnouncementId(updatedAnnouncement.announcementId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};


module.exports = {
  createAnnouncement,
  retrieveAllAnnouncements,
  retrieveAllAnnouncementsbyUserId,
  retrieveAnnouncementByUserId,
  retrieveAnnouncementByAnnouncementId,
  updateAnnouncement,
};
