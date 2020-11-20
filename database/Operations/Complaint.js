const COMPLAINT_STATUS = require('../../enum/SupportComplaintStatus');
const {Complaint} = require('../Models/Complaint');
const axios = require('axios');

/* ----------------------------------------
  Create a complaint for a request
  Parameters: (userId:'string' , addressId:'string' , description:'string', closeTime:'string of date in ISO8601 format' , destination:'string')
  Return: Complaint object
---------------------------------------- */
const createComplaint = async (
  description,
  requestId,
) => {
  try {
    const newComplaint = Complaint.build({
      description: description,
      adminResponse: null,
      complaintStatus: COMPLAINT_STATUS.PENDING,
      requestId: requestId
    });

    if (!newComplaint) {
      throw `New complaint creation failed!`;
    }

    await newComplaint.save();

    return await retrieveComplaintByComplaintId(newComplaint.complainId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve all complaints associated with a requestId
  Parameters: requestId
  Return: Array of complaint objects 
---------------------------------------- */
const retrieveAllComplaintsByRequestId = async (requestId) => {
  try {
    const complaints = await Complaint.findAll({
      where: {
        requestId: requestId,
      },
    });
    return complaints;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Retrieve a single complaint by complaintId
  Parameters: complaintId
  Return: 1 complaint object
---------------------------------------- */
const retrieveComplaintByComplaintId = async (complaintId) => {
  try {
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      throw `Complaint with ID ${complaintId} not found`
    }
    return complaint;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  For users to update the description of complaint if the complaint status is still pending
  Parameters: Complaint object
  Return: Updated complaint object
  Note: Function to be used by users
---------------------------------------- */
const updateComplaint = async (complaint) => {
  try {
    const complaintToUpdate = await retrieveComplaintByComplaintId(complaint.complaintId)
    //Backend announcement validation
    if (!complaintToUpdate) {
      throw `Complaint with ID ${complaint.complaintId} not found!`;
    }

    // Check if the announcement is still pending to allow edit
    if ( complaintToUpdate.complaintStatus === COMPLAINT_STATUS.REJECTED || complaintToUpdate.complaintStatus === COMPLAINT_STATUS.RESOLVED){
      throw `Complaint with ID ${complaintToUpdate.complaintId} cannot be updated because it is already resolved or rejected.`
    }

    const updatedComplaint = await complaintToUpdate.update(complaint);
    return await retrieveComplaintByComplaintId(updatedComplaint.complaintId)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  For admins to add or update an adminResponse to a particular complaint
  Parameters: (adminResponse: string, complaintId: string)
  Return: Updated complaint object
  Note: Function to be used by admins
---------------------------------------- */
const addResponse = async (adminResponse, complaintId) => {
  try {
    const complaintToUpdate = await retrieveComplaintByComplaintId(complaintId)
    //Backend announcement validation
    if (!complaintToUpdate) {
      throw `Complaint with ID ${complaintId} not found!`;
    }
    //Admins should be able to add an adminResponse regardless of the status of complaint

    complaintToUpdate.adminResponse = adminResponse
    await complaintToUpdate.save()
    return await retrieveComplaintByComplaintId(complaintToUpdate.complaintId)
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Set the status of a complaint to resolved
  Parameters: complaintId
  Return: Complaint object
---------------------------------------- */
const resolveComplaint = async (complaintId) => {
  try {
    const complaint = await retrieveComplaintByComplaintId(complaintId);
    complaint.setResolved();
    await complaint.save();
    return complaint;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Set the status of a complaint to rejected
  Parameters: complaintId
  Return: Complaint object
---------------------------------------- */
const rejectComplaint = async (complaintId) => {
  try {
    const complaint = await retrieveComplaintByComplaintId(complaintId);
    complaint.setRejected();
    await complaint.save();
    return complaint;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/* ----------------------------------------
  Delete a complaint by complaintId
  Parameters: complaintId
  Return: Null
---------------------------------------- */
const deleteComplaintByComplaintId = async (complaintId) => {
  try {
    const complaint = await retrieveComplaintByComplaintId(complaintId)
    if (!complaint) {
      throw `Complaint with ID ${complaintId} not found`;
    }

    // Check if the announcement is still pending to allow deletion
    if ( complaint.complaintStatus === COMPLAINT_STATUS.REJECTED || complaint.complaintStatus === COMPLAINT_STATUS.RESOLVED){
      throw `Complaint with ID ${complaint.complaintId} cannot be deleted because it is already resolved or rejected.`
    }
    await complaint.destroy();
    console.log(`Complaint with ID ${complaintId} deleted successfully`)

  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createComplaint,
  retrieveAllComplaintsByRequestId,
  retrieveComplaintByComplaintId,
  updateComplaint,
  addResponse,
  resolveComplaint,
  rejectComplaint,
  deleteComplaintByComplaintId
};
