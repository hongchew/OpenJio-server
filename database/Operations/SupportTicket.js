const SUPPORT_STATUS = require('../../enum/SupportComplaintStatus');
const SUPPORT_TYPE = require('../../enum/SupportType');
const {SupportTicket} = require('../Models/SupportTicket');
const {SupportComment} = require('../Models/SupportComment');
const axios = require('axios');

/* ----------------------------------------
  Create a support ticket for a user
  Parameters: (title: string, description: string, supportType: string, supportStatus: string, userId: string)
  Return: SupportTicket object
---------------------------------------- */
const createSupportTicket = async (
  title,
  description,
  supportType,
  userId
) => {
  try {
    //Validation if the supportType passed in belongs to any of the enum
    if (
      supportType !== SUPPORT_TYPE.PROFILE &&
      supportType !== SUPPORT_TYPE.SYSTEM &&
      supportType !== SUPPORT_TYPE.PAYMENT &&
      supportType !== SUPPORT_TYPE.JIO &&
      supportType !== SUPPORT_TYPE.REQUEST &&
      supportType !== SUPPORT_TYPE.HEALTH
    ){
      throw `supportType is invalid`
    }

    const newTicket = SupportTicket.build({
      title: title,
      description: description,
      supportType: supportType,
      supportStatus: SUPPORT_STATUS.PENDING,
      userId: userId
    });

    if (!newTicket) {
      throw `New support ticket creation failed.`;
    }

    await newTicket.save();

    return await retrieveTicketByTicketId(newTicket.supportTicketId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve a single support ticket by supportTicketId
  Parameters: supportTicketId
  Return: 1 SupportTicket object together with an array of SupportComments tagged to it
---------------------------------------- */
const retrieveTicketByTicketId = async (supportTicketId) => {
  try {
    const ticket = await SupportTicket.findOne({
      where: {
        supportTicketId: supportTicketId
      },
      include: 
        {model: SupportComment, order: [['createdAt', 'DESC']]},
    });
    if (!ticket) {
      throw `Support ticket with ID ${supportTicketId} not found`
    }

    //should return the list of comments as well
    return ticket;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all support tickets associated with a user
  Parameters: userId
  Return: Array of SupportTicket objects with arrays of SupportComments tagged to it
---------------------------------------- */
const retrieveAllTicketsByUserId = async (userId) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: {
        userId: userId,
      },
      include: 
        {model: SupportComment, order: [['createdAt', 'DESC']]},
    });
    return tickets;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all active support tickets associated with a user
  Parameters: userId
  Return: Array of SupportTicket objects with arrays of SupportComments tagged to it
---------------------------------------- */
const retrieveAllActiveTicketsByUserId = async (userId) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: {
        userId: userId,
        supportStatus: SUPPORT_STATUS.PENDING
      },
      include: 
        {model: SupportComment, order: [['createdAt', 'DESC']]},
    });
    return tickets;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all active(PENDING) support tickets 
  Parameters: -
  Return: Array of SupportTicket objects with arrays of SupportComments tagged to it
---------------------------------------- */
const retrieveAllActiveTickets = async () => {
  try {
    const tickets = await SupportTicket.findAll({
      where: {
        supportStatus: SUPPORT_STATUS.PENDING,
      },
      include: 
        {model: SupportComment, order: [['createdAt', 'DESC']]},
    });
    return tickets;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  For users to update the details of support ticket if the ticket status is still pending, including supportType
  Parameters: SupportTicket object
  Return: Updated SupportTicket object
  Note: Function to be used by users
---------------------------------------- */
const updateTicket = async (supportTicket) => {
  try {
    const ticketToUpdate = await retrieveTicketByTicketId(supportTicket.supportTicketId)
    //Backend ticket validation
    if (!ticketToUpdate) {
      throw `Support ticket with ID ${supportTicket.supportTicketId} not found`;
    }

    // Check if the ticket is still pending to allow edit
    if (ticketToUpdate.supportStatus === SUPPORT_STATUS.REJECTED || ticketToUpdate.supportStatus === SUPPORT_STATUS.RESOLVED){
      throw `Support ticket with ID ${ticketToUpdate.supportTicketId} cannot be updated because it is already resolved or rejected.`
    }

    //Validation if the supportType passed in belongs to any of the enum
    if (
      supportTicket.supportType !== SUPPORT_TYPE.PROFILE &&
      supportTicket.supportType !== SUPPORT_TYPE.SYSTEM &&
      supportTicket.supportType !== SUPPORT_TYPE.PAYMENT &&
      supportTicket.supportType !== SUPPORT_TYPE.JIO &&
      supportTicket.supportType !== SUPPORT_TYPE.REQUEST &&
      supportTicket.supportType !== SUPPORT_TYPE.HEALTH
    ){
      throw `supportType is invalid`
    }

    const updatedTicket = await ticketToUpdate.update(supportTicket);
    return await retrieveTicketByTicketId(updatedTicket.supportTicketId)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Set the status of a support ticket to resolved
  Parameters: supportTicketId
  Return: SupportTicket object
---------------------------------------- */
const resolveTicket = async (supportTicketId) => {
  try {
    const ticket = await retrieveTicketByTicketId(supportTicketId);
    if (!ticket) {
      throw `Support ticket with ID ${supportTicketId} not found`;
    }
    ticket.setResolved();
    await ticket.save();
    return ticket;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Set the status of a support ticket to rejected
  Parameters: supportTicketId
  Return: SupportTicket object
---------------------------------------- */
const rejectTicket = async (supportTicketId) => {
  try {
    const ticket = await retrieveTicketByTicketId(supportTicketId);
    if (!ticket) {
      throw `Support ticket with ID ${supportTicketId} not found`;
    }
    ticket.setRejected();
    await ticket.save();
    return ticket;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Delete a support ticket by supportTicketId
  Parameters: supportTicketId
  Return: Null
---------------------------------------- */
const deleteTicketByTicketId = async (supportTicketId) => {
  try {
    const ticket = await retrieveTicketByTicketId(supportTicketId)
    if (!ticket) {
      throw `SupportTicket with ID ${supportTicketId} not found`;
    }

    // Check if the ticket is still pending to allow deletion
    if ( ticket.supportStatus === SUPPORT_STATUS.REJECTED || ticket.supportStatus === SUPPORT_STATUS.RESOLVED){
      throw `SupportTicket with ID ${ticket.supportTicketId} cannot be deleted because it is already resolved or rejected.`
    }

    //Ticket cannot be deleted if there are support comments tagged to it.
    if(ticket.SupportComments.length !== 0 ){
      throw `SupportTicket with ID ${ticket.supportTicketId} cannot be deleted because there are SupportComments to it.`
    }

    await ticket.destroy();
    console.log(`SupportTicket with ID ${supportTicketId} deleted successfully`)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createSupportTicket,
  retrieveTicketByTicketId,
  retrieveAllTicketsByUserId,
  retrieveAllActiveTicketsByUserId,
  retrieveAllActiveTickets,
  updateTicket,
  resolveTicket,
  rejectTicket,
  deleteTicketByTicketId
};
