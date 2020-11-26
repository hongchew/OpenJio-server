const {Notification} = require('../Models/Notification');

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

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getAllNotificationsByUserId,
  sendNotificationToMultipleUsers,
  deleteNotification
};
