const {Announcement} = require('../Models/Announcement');

/* ----------------------------------------
  ATTENTION: STILL A WORK IN PROGRESS
  Create an announcement tagged to a user
  Parameters: (userId, startLocation, description, closeTime
  Return: Announcement object
---------------------------------------- */
const createAnnouncement = async (
  userId,
  startLocation,
  description,
  closeTime,
  addressId
) => {
  try {
    const newAnnouncement = Announcement.build({
      userId: userId,
      announcementStatus: 'ACTIVE',
      description: description,
      closeTime: closeTime //need to figure out time conversion
      
    });
    setTimeout(closeAnnouncement(announcementId), 3600000);
    await newAnnouncement.save();

    return newAnnouncement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all transactions associated with a user
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
  Retrieve a single announcement by userId, usually used for announcement updates
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
  Retrieve a single announcement by announcementId, used for internal purposes
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
  Update an announcement to PAST upon timeout
  Parameters: announcementId
  Return: Null
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
    return await retrieveAnnouncementByAnnouncementId(closedAnnouncement.announcementId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};


module.exports = {
  createAnnouncement,
  retrieveAllAnnouncementsbyUserId,
  retrieveAnnouncementByUserId,
  retrieveAnnouncementByAnnouncementId
};
