const ANNOUNCEMENT_STATUS = require('../../enum/AnnouncementStatus');
const {Announcement} = require('../Models/Announcement');
const {User} = require('../Models/User');

/* ----------------------------------------
  Create an announcement tagged to a user
  Parameters: (userId:'string' , addressId:'string' , description:'string', closeTime:'string of date in ISO8601 format' , destination:'string')
  Return: Announcement object
  Note: startLocation stores the addressId being used, closeTime contains the string of date in ISO8601 format
---------------------------------------- */
const createAnnouncement = async (
  userId,
  addressId,
  description,
  closeTime,
  destination
) => {
  try {
    const newAnnouncement = Announcement.build({
      userId: userId,
      announcementStatus: ANNOUNCEMENT_STATUS.ACTIVE,
      description: description,
      startLocation: addressId,
      destination: destination,
      closeTime: new Date (closeTime) //since it is returned to us in a JSON format
    });

    if (!newAnnouncement) {
      throw `Announcement creation failed!`;
    }
    await newAnnouncement.save();

    //Setting the timeout of the close time
    const now = new Date().getTime();
    var timeDiff = new Date(closeTime).getTime() - now;
    setTimeout(function () {
      closeAnnouncement(newAnnouncement.announcementId);
    }, timeDiff)

    return newAnnouncement;
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
    announcement.disableAnnouncement();
    await announcement.save()
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
    const announcements = await Announcement.findAll({
      include: { 
        model: User, 
        attributes: { 
          exclude: ["salt", "password"] 
        }
      }
    });
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
const retrieveAllAnnouncementsByUserId = async (userId) => {
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

/* ----------------------------------------
  Delete an announcement
  Parameters: announcementId
  Return: Null
---------------------------------------- */
const deleteAnnouncementByAnnouncementId = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(announcementId);
    if (!announcement) {
      throw `Announcement ${announcementId} is not found`;
    }
    await announcement.destroy();

    return `Announcement ${announcementId} successfully deleted`;
  } catch (e) {
    console.log(e);
    throw e;
  }
};


module.exports = {
  createAnnouncement,
  retrieveAllAnnouncements,
  retrieveAllAnnouncementsByUserId,
  retrieveAnnouncementByUserId,
  retrieveAnnouncementByAnnouncementId,
  updateAnnouncement,
  deleteAnnouncementByAnnouncementId
};
