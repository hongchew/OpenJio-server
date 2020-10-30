const ANNOUNCEMENT_STATUS = require('../../enum/AnnouncementStatus');
const {Announcement} = require('../Models/Announcement');
const axios = require('axios');
const {retrieveAddressByAddressId} = require('./Address');
const {retrieveAllRequestsByAnnouncementId} = require('./Request');
const {Request} = require('../Models/Request');
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
      closeTime: new Date(closeTime), //since it is returned to us in a JSON format
    });

    if (!newAnnouncement) {
      throw `Announcement creation failed!`;
    }

    // Associating announcement to user (announcer)
    newAnnouncement.userId = userId;

    await newAnnouncement.save();

    // Setting the timeout of the close time
    const now = new Date().getTime();
    var timeDiff = new Date(closeTime).getTime() - now;
    setTimeout(function () {
      closeAnnouncement(newAnnouncement.announcementId);
    }, timeDiff);

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
    const announcement = await retrieveAnnouncementByAnnouncementId(
      announcementId
    );
    //Backend announcement validation
    if (!announcement) {
      throw `Announcement ${announcementId} not found!`;
    }
    announcement.disableAnnouncement();
    await announcement.save();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all nearby announcements within a 100m radius
  Parameters: addressId
  Return: Array of announcement objects
---------------------------------------- */
const retrieveNearbyAnnouncements = async (addressId) => {
  try {
    //Getting my address and it's postal code
    const myAddress = await retrieveAddressByAddressId(addressId);
    if (!myAddress) {
      throw `Address ${addressID} is not found in the database`;
    }
    const myPostalCode = myAddress.postalCode;

    //Getting the X and Y coordinates of my postal code from One Map API
    const myAddressDetails = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${myPostalCode}&returnGeom=Y&getAddrDetails=N`
    );
    if (myAddressDetails.data.found == 0) {
      throw `No landmarks are found in the nearby vicinity after one map API call`;
    }
    const lat = myAddressDetails.data.results[0].LATITUDE;
    const long = myAddressDetails.data.results[0].LONGITUDE;

    const announcements = await retrieveAllAnnouncements();
    //To get only active announcements
    const activeAnnouncements = announcements.filter(
      (announcement) => announcement.announcementStatus === 'ACTIVE'
    );
    //To get the announcements within a 400m distance
    const filteredAnnouncements = await filterAnnouncements(activeAnnouncements, lat, long)
    return filteredAnnouncements;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Nested function from parent RetrieveNearbyAnnouncements to do filtering for distance
  Parameters: activeAnnouncements, start latitude, start longitude
  Return: Array of announcements that are within 400m
---------------------------------------- */
const filterAnnouncements = async (activeAnnouncements, lat, long) => {
  try {
    const result = []
    console.log(`Looping through each announcement to calculate distance now`)
    await Promise.all(activeAnnouncements.map(async(announcement) => {
      const distance = await calculateDistance(announcement, lat, long)
      if (distance < 400){
        result.push(announcement)
      }
    }));
    return result
  } catch (e) {
    console.log(e)
    throw e
  }
}

/* ----------------------------------------
  Nested function from parent filterAnnouncements to calculate the distance between each announcement and the starting point
  Parameters: announcement, start latitude, start longitude
  Return: Integer of distance
---------------------------------------- */
const calculateDistance = async (announcement, lat, long) => {
  try {
    //get address object of each announcement
    const announcementAddress = await retrieveAddressByAddressId(
      announcement.startLocation
    );
    if (!announcementAddress) {
      throw `Announcement's address is not found in the database`;
    }
    const announcementPostal = announcementAddress.postalCode;

    //Getting the longitude and latitude of the announcement address
    const announcementAddressDetails = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${announcementPostal}&returnGeom=Y&getAddrDetails=N`
    );
    if (announcementAddressDetails.data.found == 0) {
      throw `No landmarks are found in the vicinity of the announcement's postal code from OneMap API call`;
    }
    const latAnnouncement = announcementAddressDetails.data.results[0].LATITUDE;
    const longAnnouncement = announcementAddressDetails.data.results[0].LONGITUDE;
    //Converting the long and lat to radian
    const pi = Math.PI;
    const longStart = long * (pi/180)
    const longAnn = longAnnouncement * (pi/180)
    const latStart = lat * (pi/180) 
    const latAnn = latAnnouncement * (pi/180)
    const distLong = longAnn - longStart;
    const distLat = latAnn - latStart
    const a = Math.pow(Math.sin(distLat / 2), 2) + Math.cos(latStart) * Math.cos(latAnn) * Math.pow(Math.sin(distLong / 2),2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const radius = 6371; //radius of the earth in km
    return(c * radius * 1000);
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
        userId: userId,
      },
    });
    return announcements;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all requests associated with an announcement
  Parameters: announcementId
  Return: Array of request objects 
---------------------------------------- */
const retrieveAllRequestsForAnnouncement = async (announcementId) => {
  try {

    const requests = await Request.findAll({
      where: {
        announcementId: announcementId
      },
    });

    return requests;
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
        userId: userId,
      },
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
    const announcementToUpdate = await retrieveAnnouncementByAnnouncementId(
      announcement.announcementId
    );
    //Backend announcement validation
    if (!announcementToUpdate) {
      throw `Announcement ${announcement.announcementId} not found!`;
    }

    // Check if the announcement has already been accepted or past, if so, announcement cannot be updated
    if (
      announcementToUpdate.announcementStatus === ANNOUNCEMENT_STATUS.ONGOING
    ) {
      throw `Announcement with ID: ${announcement.announcementId} is already ongoing and cannot be updated!`;
    } else if (
      announcementToUpdate.announcementStatus === ANNOUNCEMENT_STATUS.PAST
    ) {
      throw `Announcement with ID: ${announcement.announcementId} is already closed and cannot be updated!`;
    }

    const updatedAnnouncement = await announcementToUpdate.update(announcement);
    return await retrieveAnnouncementByAnnouncementId(
      updatedAnnouncement.announcementId
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Delete an announcement by announcement ID
  Parameters: announcementId
  Return: Null
---------------------------------------- */
const deleteAnnouncementByAnnouncementId = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(
      announcementId
    );
    if (!announcement) {
      throw `Announcement ${announcementId} is not found`;
    }

    // Check if the announcement has already been accepted or past, if so, announcement cannot be deleted
    if (
      announcement.announcementStatus === ANNOUNCEMENT_STATUS.ONGOING ||
      announcement.announcementStatus === ANNOUNCEMENT_STATUS.PAST
    ) {
      throw `Announcement with ID: ${announcement.announcementId} is already ongoing or closed and cannot be deleted!`;
    }

    const userId = announcement.userId;
    const announcementDeleted = await announcement.destroy();

    if (announcementDeleted) {
      console.log('Announcement with ID: ' + announcementId + ' successfully deleted!');
      return await retrieveAnnouncementByUserId(userId);
      // return `Announcement ${announcementId} successfully deleted`;
    } else {
      throw 'Failed to delete announcement with ID: ' + announcementId;
    }

  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
Set announcement as ONGOING
Parameters: announcementId
Return: Announcement Object
*/
const ongoingAnnouncement = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(announcementId);
    announcement.ongoingAnnouncement();
    await announcement.save();
    return announcement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
Set announcement as PAST
Parameters: announcementId
Return: Announcement Object
*/
const pastAnnouncement = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(announcementId);
    announcement.disableAnnouncement();
    await announcement.save();
    return announcement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
Set announcement as ACTIVE
Parameters: announcementId
Return: Announcement Object
*/
const activeAnnouncement = async (announcementId) => {
  try {
    const announcement = await retrieveAnnouncementByAnnouncementId(announcementId);
    announcement.activateAnnouncement();
    await announcement.save();
    return announcement;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createAnnouncement,
  retrieveNearbyAnnouncements,
  retrieveAllAnnouncements,
  retrieveAllAnnouncementsByUserId,
  retrieveAllRequestsForAnnouncement,
  retrieveAnnouncementByUserId,
  retrieveAnnouncementByAnnouncementId,
  updateAnnouncement,
  deleteAnnouncementByAnnouncementId,
  ongoingAnnouncement,
  pastAnnouncement,
  activeAnnouncement
};
