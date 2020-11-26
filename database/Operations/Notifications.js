const {Notification} = require('../Models/Notification');
const {User} = require('../Models/User');
const {Address} = require('../Models/Address');

const {Op, Sequelize} = require('sequelize');

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
const markNotificationAsRead = async (notificationid) => {
  try {
    const notif = await Notification.findOne({
      where: {
        userId,
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

    const affectedUsers = users.filter( (user) => {
      const defaultAddressPostalCode = user.Addresses[0].postalCode;
      // check defaultAddressPostalCode against OneMap
      var isNearOutbreakZone = false; //stub

      //#region compare postal code, delete region when one map API implemented
      if(defaultAddressPostalCode.substring(0, 2) === outbreakZone.postalCode.substring(0,2)){
        isNearOutbreakZone = true;
      }
      //#endregion

      console.log(isNearOutbreakZone)
      return isNearOutbreakZone; //need to return true if near, false if not near
    });


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

  } catch (e) {
    throw e;
  }
};

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getAllNotificationsByUserId,
  sendNotificationToMultipleUsers,
  deleteNotification,
  sendOutbreakNotification,
};
