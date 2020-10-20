const express = require('express');
const router = express.Router();
const {Address} = require('../database/Models/Address');
const {addAddress, deleteAddressByAddresId, retrieveAllAddressesByUserId} = require('../database/Operations/Address');

/*
  Endpoint: POST /addresses/add
  Content type: JSON { 
    userId: string,
    address: {
      line1: string,
      line2: string,
      postalCode: string,
      country: string,
      description: string
    } 
  }
  Return: Array of all addresses associated with users 
*/
router.post('/add', async (req, res) => {
  try {
    const {userId, address} = req.body;
    const newAddressList = await addAddress(userId, address);
    res.status(200).json(newAddressList);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*
  Endpoint: DELETE /addresses/delete
  Content type: JSON { addressId: string }
  Return: Array of all addresses associated with users 
*/
router.delete('/:addressId', async (req, res) => {
  try {
    const newAddressList = await deleteAddressByAddresId(req.params.addressId);
    res.status(200).json(newAddressList);
  } catch (e) {
    res.status(500).json(e);
  }
});

/*
  Endpoint: Get /addresses/:userId
  Content type: JSON { userId: string }
  Return: Array of all addresses associated with users 
*/
router.get('/:userId', async (req, res) => {
  try {
    const addressList = await retrieveAllAddressesByUserId(req.params.userId);
    res.status(200).json(addressList);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
