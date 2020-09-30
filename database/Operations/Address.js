const {Address} = require('../Models/Address');

/*
  Create an address, associate with user, add to database
  Parameters: (
    userId: string,
    address: {
      line1: string,
      line2: string,
      postalCode: string,
      country: string,
      description: string
    } 
  )
  Return: Array of all addresses associated with the user
*/
const addAddress = async (userId, address) => {
  try {
    const newAddress = Address.build(address);
    console.log(newAddress);
    newAddress.userId = userId;

    await newAddress.save();

    return await retrieveAllAddressesByUserId(newAddress.userId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Delete instance of address from db given addressId
  Parameters: (addressId: string)
  Return: Array of all addresses associated with the users
*/
const deleteAddressByAddresId = async (addressId) => {
  try {
    const address = await retrieveAddressByAddressId(addressId);
    if (!address) {
      throw 'address not found';
    }
    const userId = address.userId;
    await address.destroy();

    return await retrieveAllAddressesByUserId(userId);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve all addresses associated with given userId
  Parameters: (userId: string)
  Return: Array of Model.Address
*/
const retrieveAllAddressesByUserId = async (userId) => {
  try {
    const addresses = await Address.findAll({
      where: {
        userId: userId,
      },
    });
    console.log(addresses);
    return addresses;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Retrieve one addresses associated by addressId
  Parameters: (userId: string)
  Return: Model.Address
*/
const retrieveAddressByAddressId = async (addressId) => {
  try {
    const address = await Address.findOne({
      where: {
        addressId: addressId,
      },
    });
    console.log(address);
    return address;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  addAddress,
  deleteAddressByAddresId
};
