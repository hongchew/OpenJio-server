const {SupportComment} = require('../Models/SupportComment');
const {SupportTicket} = require('../Models/SupportTicket');
const SUPPORT_STATUS = require('../../enum/SupportComplaintStatus');

/* ----------------------------------------
  Create a SupportComment for a support ticket
  Parameters: (title: string, description: string, supportType: string, supportStatus: string, userId: string)
  Return: SupportTicket object
---------------------------------------- */
const createComment = async (
  description,
  isPostedByAdmin,  //boolean value
  adminId           //adminId field is null "" if the comment is made by user
) => {
  try {
    const newComment = SupportComment.build({
      description: description,
      isPostedByAdmin: isPostedByAdmin,
      adminId: isPostedByAdmin ? adminId : null
    });

    if (!newComment) {
      throw `New support comment creation failed.`;
    }

    await newComment.save();

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
      throw `SupportComment with ID ${supportCommentId} not found`
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
  For users or admins to update the details of SupportComment
  Parameters: SupportComment object
  Return: Updated SupportComment object
---------------------------------------- */
const updateComment = async (supportComment) => {
  try {
    const commentToUpdate = await retrieveCommentByCommentId(supportComment.CommentId)
    //Backend ticket validation
    if (!commentToUpdate) {
      throw `SupportComment with ID ${supportComment.supportCommentId} not found`;
    }

    const supportTicketId = commentToUpdate.supportTicketId
    const ticket = await SupportTicket.findByPk(supportTicketId)

    //if the SupportTicket status is already resolved or rejected, only SupportComments that are created by admin can be edited by Admins
    if ((ticket.supportStatus === SUPPORT_STATUS.REJECTED || ticket.supportStatus === SUPPORT_STATUS.RESOLVED) && !commentToUpdate.isPostedByAdmin){
      throw `SupportComment with ID ${commentToUpdate.supportCommentId} cannot be edited by user because it is already resolved or rejected and it is not created by admin.`
    }

    const updatedComment = await commentToUpdate.update(supportComment);
    return await retrieveCommentByCommentId(updatedComment.supportCommentId)
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
    const comment = await retrieveCommentByCommentId(supportCommentId)
    if (!comment) {
      throw `SupportComment with ID ${supportCommentId} not found`;
    }

    const supportTicketId = comment.supportTicketId
    const ticket = await SupportTicket.findByPk(supportTicketId)

    //if the SupportTicket status is already resolved or rejected, only SupportComments that are created by admin can be deleted by Admins
    if ((ticket.supportStatus === SUPPORT_STATUS.REJECTED || ticket.supportStatus === SUPPORT_STATUS.RESOLVED) && !comment.isPostedByAdmin){
      throw `SupportComment with ID ${comment.supportCommentId} cannot be deleted by user because it is already resolved or rejected and it is not created by admin.`
    }

    await comment.destroy();
    //return an array of the rest of the SupportComments that are not yet deleted.
    return await retrieveAllCommentsByTicketId(supportTicketId)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createComment,
  retrieveCommentByCommentId,
  retrieveAllCommentsByTicketId,
  updateComment,
  deleteCommentByCommentId
};
