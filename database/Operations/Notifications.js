const {Notification} = require('../Models/Notification');
const {User} = require('../Models/User');
const {Address} = require('../Models/Address');

const {Op, Sequelize} = require('sequelize');
const axios = require('axios');

/*
  create and insert notification into database
  Parameters: (userId: string, title: string, content: string)
  Return: -
*/
const sendNotification = async (userId, title, content) => {
  try {
    const newNotification = await Notification.build({
      title,
      content,
      userId,
    });

    await newNotification.save();
  } catch (e) {
    throw e;
  }
};

/*
  create and insert multiple notification into database
  Parameters: (users: User[], title: string, content: string)
  Return: -
*/
const sendNotificationToMultipleUsers = async (users, title, content) => {
  try {
    await Promise.all(
      users.map((user) => sendNotification(user.userId, title, content))
    );
  } catch (e) {
    throw e;
  }
};

/*
  retrieve all notifications associated with users
  Parameters: (userId: string)
  Return: Notification[]
*/
const getAllNotificationsByUserId = async (userId) => {
  try {
    const notifs = await Notification.findAll({
      where: {
        userId,
      },
    });

    return notifs;
  } catch (e) {
    throw e;
  }
};

/*
  change isRead flag to true
  Parameters: (notificationId: string)
  Return: -
*/
const markNotificationAsRead = async (notificationId) => {
  try {
    const notif = await Notification.findOne({
      where: {
        notificationId,
      },
    });

    notif.isRead = true;
    await notif.save();
  } catch (e) {
    throw e;
  }
};

/*
  delete notification from database
  Parameters: (notificationId: string)
  Return: -
*/
const deleteNotification = async (notificationid) => {
  try {
    const resp = await Notification.destroy({
      where: {
        notificationid,
      },
    });

    return resp ? true : false;
  } catch (e) {
    throw e;
  }
};

/*
  create and insert notification into database
  Parameters: (userId: string, title: string, content: string)
  Return: -
*/
const sendOutbreakNotification = async (outbreakZone) => {
  try {
    console.log(`Start outbreak notification`)
    //Getting the longitude and latitude of the outbreakzone's postal code
    const response = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${outbreakZone.postalCode}&returnGeom=Y&getAddrDetails=Y`
    );
    if (response.data.found == 0) {
      throw `No landmarks are found in the vicinity of the outbreak zone's postal code from OneMap API call`;
    }
    const zoneLat = response.data.results[0].LATITUDE;
    const zoneLong = response.data.results[0].LONGITUDE;

    //retrieve users with only their default address
    const users = await User.findAll({
      where: {
        defaultAddressId: {
          [Op.not]: null,
        },
      },
      include: [
        {
          model: Address,
          where: {
            addressId: {[Op.col]: 'user.defaultAddressId'}, //retrieve user where an instance of user.address.addressId = user.defaultAddressId
          },
        },
      ],
    });

    const affectedUsers = []
    await Promise.all(users.map(async(user) => {
      const defaultAddressPostalCode = user.Addresses[0].postalCode;

      //OneMap API version
      const distance = await calculateOutbreakDistance(defaultAddressPostalCode, zoneLat, zoneLong)
      console.log(`Distance is ${distance}`)
      if (distance < 1000) {
        // isNearOutbreakZone = true
        affectedUsers.push(user)
      }

    }));

    console.log(affectedUsers)
    sendNotificationToMultipleUsers(
      affectedUsers,
      'COVID-19 Reported in Your Area',
      `Dear User,\n
A user that had recently declared their diagnosis for COVID-19 was staying near your default address at their time of diagnosis.\n
Although this is not a cause for concern, and you can still use OpenJio as per normal, we urge for you to keep a closer watch for any COVID-19 related symptoms such as cough, fever, loss of taste or smell.\n
Please visit the nearest medical practitioner such as a Polyclinic or Hospital if such symptoms occur.\n
\n
The OpenJio Team`
    );
    console.log(`Completed creating all notifications`)
  } catch (e) {
    throw e;
  }
};

const calculateOutbreakDistance = async (addrPostalCode, zoneLat, zoneLong) => {
  try {
    //Getting the longitude and latitude of the announcement address
    const response = await axios.get(
      `https://developers.onemap.sg/commonapi/search?searchVal=${addrPostalCode}&returnGeom=Y&getAddrDetails=N`
    );
    if (response.data.found == 0) {
      throw `No landmarks in the vicinity of default address postal code`;
    }
    const addrLat = response.data.results[0].LATITUDE;
    const addrLong = response.data.results[0].LONGITUDE;

    //Converting the long and lat to radian
    const pi = Math.PI;
    const longStart = zoneLong * (pi/180)
    const longAnn = addrLong * (pi/180)
    const latStart = zoneLat * (pi/180) 
    const latAnn = addrLat * (pi/180)
    const distLong = longAnn - longStart;
    const distLat = latAnn - latStart
    const a = Math.pow(Math.sin(distLat / 2), 2) + Math.cos(latStart) * Math.cos(latAnn) * Math.pow(Math.sin(distLong / 2),2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const radius = 6371; //radius of the earth in km
    return(c * radius * 1000); // return radial distance between outbreak zone and default address in metres

  } catch (e) {
    console.log(e)
  } 
}

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getAllNotificationsByUserId,
  sendNotificationToMultipleUsers,
  deleteNotification,
  sendOutbreakNotification,
};
