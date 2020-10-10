const {Wallet} = require('../Models/Wallet');

/*
  Create an insert wallet into database
  Parameters: (userId: string)
  Return: Wallet object
*/
const createWallet = async (userId) => {
  try {
    const newWallet = Wallet.build({
      userId
    });
    await newWallet.save();


  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  createWallet
}