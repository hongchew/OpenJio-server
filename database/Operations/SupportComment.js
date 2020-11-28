const {SupportComment} = require('../Models/SupportComment');
const {SupportTicket} = require('../Models/SupportTicket');
const {User} = require('../Models/User');
const SUPPORT_STATUS = require('../../enum/SupportStatus');
const { retrieveTicketByTicketId } = require('./SupportTicket');
const { sendNotification } = require('./Notifications');

/* ----------------------------------------
  Create a SupportComment for a support ticket
  Parameters: (title: string, description: string, supportType: string, supportStatus: string, userId: string)
  Return: SupportTicket object
---------------------------------------- */
const createComment = async (
  description,
  isPostedByAdmin, //boolean value
  adminId, //adminId field is null "" if the comment is made by user
  supportTicketId
) => {
  try {
    const newComment = SupportComment.build({
      description: description,
      isPostedByAdmin: isPostedByAdmin,
      adminId: isPostedByAdmin ? adminId : null,
      supportTicketId: supportTicketId,
    });

    if (!newComment) {
      throw `New support comment creation failed.`;
    }

    // If support ticket is closed, stop accepting comments
    const supportTicket = await retrieveTicketByTicketId(supportTicketId);
    if (supportTicket.supportStatus === SUPPORT_STATUS.RESOLVED){
      throw `Support Ticket with ID ${supportTicketId} has already closed, and no further response can be made.`;
    }

    await newComment.save();

    // Send notification to user whenever admin respond to the support ticket
    if(isPostedByAdmin){
      const title = "New reply for your support ticket!";
      const content = `New reply for your support ticket with title: ${supportTicket.title} \n Reply: ${description}`;
      await sendNotification(supportTicket.userId, title, content);
    }

    return await retrieveCommentByCommentId(newComment.supportCommentId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve a SupportComment by supportCommentId
  Parameters: supportCommentId
  Return: 1 SupportTicket object
---------------------------------------- */
const retrieveCommentByCommentId = async (supportCommentId) => {
  try {
    const comment = await SupportComment.findByPk(supportCommentId);
    if (!comment) {
      throw `SupportComment with ID ${supportCommentId} not found`;
    }
    return comment;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all SupportComments associated with a SupportTicket
  Parameters: supportTicketId
  Return: Array of SupportComment objects from the latest to oldest
---------------------------------------- */
const retrieveAllCommentsByTicketId = async (supportTicketId) => {
  try {
    const comments = await SupportComment.findAll({
      where: {
        supportTicketId: supportTicketId,
      },
    });

    //sort the comments from latest to oldest
    const sortedComments = comments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return sortedComments;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve 5 most active SupportComments sorted by date
  Parameters: (null)
  Return: Array of SupportComment objects
---------------------------------------- */
const retrieve5MostRecentCommentsFromUsers = async () => {
  try {
    const recentComments = await SupportComment.findAll({
      // Order from latest to oldest
      order: [
        ['createdAt', 'DESC'],
      ],
      // Comments by users
      where:{
        isPostedByAdmin: false
      },
      // Limit to 5 most recent
      limit: 5,
      // Include support ticket for displaying related fields 
      // and retrieve only comments for tickets that are still "PENDING"
      include: [{
        model: SupportTicket,
        where: {
          supportStatus: "PENDING"
        },
        // Include User to get the username etc.
        include:[{
          model: User,
          attributes: ['name', 'email', 'mobileNumber'],
          // attributes: {
          //   exclude: ['salt', 'password'],
          // },
        }]
      }]
    });

    //sort the comments from latest to oldest
    // const sortedComments = comments.sort(
    //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    // );

    return recentComments;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  For users or admins to update the details of SupportComment
  Parameters: SupportComment object
  Return: Updated SupportComment object
---------------------------------------- */
const updateComment = async (supportComment) => {
  try {
    const commentToUpdate = await retrieveCommentByCommentId(
      supportComment.supportCommentId
    );
    //Backend ticket validation
    if (!commentToUpdate) {
      throw `SupportComment with ID ${supportComment.supportCommentId} not found`;
    }

    const supportTicketId = commentToUpdate.supportTicketId;
    const ticket = await SupportTicket.findByPk(supportTicketId);

    //if the SupportTicket status is already resolved, only SupportComments that are created by admin can be edited by Admins
    if (
      (ticket.supportStatus === SUPPORT_STATUS.RESOLVED) &&
      !commentToUpdate.isPostedByAdmin
    ) {
      throw `SupportComment with ID ${commentToUpdate.supportCommentId} cannot be edited by user because it is already resolved and it is not created by admin.`;
    }

    const updatedComment = await commentToUpdate.update(supportComment);
    return await retrieveCommentByCommentId(updatedComment.supportCommentId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Delete a SupportComment by supportCommentId if the SupportTicket of this comment is still pending
  Parameters: supportCommentId
  Return: Null
---------------------------------------- */
const deleteCommentByCommentId = async (supportCommentId) => {
  try {
    const comment = await retrieveCommentByCommentId(supportCommentId);
    if (!comment) {
      throw `SupportComment with ID ${supportCommentId} not found`;
    }

    const supportTicketId = comment.supportTicketId;
    const ticket = await SupportTicket.findByPk(supportTicketId);

    //if the SupportTicket status is already resolved, only SupportComments that are created by admin can be deleted by Admins
    if (
      (ticket.supportStatus === SUPPORT_STATUS.RESOLVED) &&
      !comment.isPostedByAdmin
    ) {
      throw `SupportComment with ID ${comment.supportCommentId} cannot be deleted by user because it is already resolved and it is not created by admin.`;
    }

    await comment.destroy();
    //return an array of the rest of the SupportComments that are not yet deleted.
    return await retrieveAllCommentsByTicketId(supportTicketId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createComment,
  retrieveCommentByCommentId,
  retrieve5MostRecentCommentsFromUsers,
  retrieveAllCommentsByTicketId,
  updateComment,
  deleteCommentByCommentId,
};
