const ANNOUNCEMENT_STATUS = require('../../enum/AnnouncementStatus');
const {Announcement} = require('../Models/Announcement');
const axios = require('axios');
const {retrieveAddressByAddressId} = require('./Address');

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
  Retrieve all nearby announcements within a 100m radius
  Parameters: addressId
  Return: Array of announcement objects
---------------------------------------- */
const retrieveNearbyAnnouncements = async (addressId) => {
  try {
    //Getting my address and it's postal code
    const myAddress = await retrieveAddressByAddressId(addressId)
    if (!myAddress){
      throw `Address ${addressID} is not found in the database`
    }
    const myPostalCode = myAddress.postalCode

    //Getting the X and Y coordinates of my postal code from One Map API
    const myAddressDetails = await axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${myPostalCode}&returnGeom=Y&getAddrDetails=N`)
    console.log(myAddressDetails)
    if(myAddressDetails.data.found == 0){
      throw `No landmarks are found in the nearby vicinity after one map API call`
    }
    const xCoordinate = myAddressDetails.data.results[0].X
    const yCoordinate = myAddressDetails.data.results[0].Y
    console.log(`X coordinate of my address is ${xCoordinate} and Y coordinate is ${yCoordinate}`)

    const announcements = await retrieveAllAnnouncements()
    const activeAnnouncements = announcements.filter(
      (announcement) =>
        announcement.announcementStatus === 'ACTIVE'
    );

    console.log(`Mapping through each announcements retrieved to start filtering`)
    const filteredAnnouncements = []
  //   activeAnnouncements.forEach((announcement) => {
  //     filterAnnouncements(announcement, xCoordinate, yCoordinate) 
  //   })
  //   console.log(`Filtered announcements is:`)
  //   console.log(filteredAnnouncements)
  //   return filteredAnnouncements;
   } catch (e) {
    console.log(e);
    throw e;
  }
};

const filterAnnouncements = async(announcement, xCoordStart, yCoordStart) => {
  try {
    //get address object of each announcement
    const announcementAddress = await retrieveAddressByAddressId(announcement.startLocation)
    if (!announcementAddress){
      throw `Announcement's address is not found in the database`
    }
    const announcementPostal = announcementAddress.postalCode
    //Getting the X and Y coordinates of the announcement address
    const announcementAddressDetails = await axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${announcementPostal}&returnGeom=Y&getAddrDetails=N`)
    if(announcementAddressDetails.data.found == 0){
      throw `No landmarks are found in the vicinity of the announcement's postal code from OneMap API call`
    }
    //console.log(announcementAddressDetails.data.results[0])
    const xCoordAnnouncement = announcementAddressDetails.data.results[0].X
    const yCoordAnnouncement = announcementAddressDetails.data.results[0].Y
    //console.log(`X coordinate of announcement address is ${xCoordAnnouncement} and Y coordinate is ${yCoordAnnouncement}`)
    const xDifference = xCoordStart - xCoordAnnouncement
    const yDifference = yCoordStart - yCoordAnnouncement
    console.log(`X coordinate difference is ${xDifference} and Y coordinate difference is ${yDifference}`)
    if (xCoordStart == xCoordAnnouncement){
      //console.log(`X coordinates are the same for start and announcement point`)
      return (yDifference < 400 || yDifference > -400) ? true : false; 
    } else if (yCoordStart == yCoordAnnouncement){
      return (xDifference < 400 || xDifference > -400) ? true : false; 
    } else {
      const distance = Math.sqrt(Math.pow(xDifference,2) + Math.pow(yDifference,2))
      console.log(`Diagonal distance is ${distance}`)
      return (distance < 16000) ? true : false;
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

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
  retrieveNearbyAnnouncements,
  retrieveAllAnnouncements,
  retrieveAllAnnouncementsByUserId,
  retrieveAnnouncementByUserId,
  retrieveAnnouncementByAnnouncementId,
  updateAnnouncement,
  deleteAnnouncementByAnnouncementId
};
