const {createSuperAdmin} = require('./Operations/Admin');
const {createUser, giveBadge} = require('./Operations/User');
const {addAddress} = require('./Operations/Address');
const {
  retrieveWalletByUserId,
  addWalletBalance,
} = require('./Operations/Wallet');
const badgeControl = require('../enum/BadgeControl');
const {
  makeDonation,
  makeWithdrawal,
  makeTopUp,
} = require('./Operations/Transaction');
const TransactionType = require('../enum/TransactionType');
const {createAnnouncement} = require('./Operations/Announcement');
const {createRequest} = require('./Operations/Request');
const {createComplaint} = require('./Operations/Complaint');
const {createSupportTicket} = require('./Operations/SupportTicket');
const SUPPORT_TYPE = require('../enum/SupportType');

const onInitPopulateDatabase = async () => {
  // Populate admin
  console.log('****[Database] Initializing ****');
  try {
    admin = await createSuperAdmin(
      '1',
      'superadmin',
      'superadmin@openjio.com',
      'password'
    );
    console.log(
      `***[Database] Admin with id ${admin.getDataValue('adminId')} created`
    );
  } catch (error) {
    console.error('***[Database] Unable to insert default super admin:', error);
  }

  // Populating users
  try {
    // First user (John) with COVID-19 & not blacklisted
    const user1 = await createUser('john@email.com', 'password', 'John');

    user1.hasCovid = false;
    user1.isBlackListed = false;
    user1.strikeCount = 2;
    user1.isValidated = true;
    user1.mobileNumber = '97748080';
    user1.avatarPath = './files/john.jpg';

    await giveBadge(user1.userId, badgeControl.types.LOCAL_LOBANG);

    // Add to user address
    const address1 = {
      line1: '181 Stirling Road',
      line2: '#12-34',
      postalCode: '140181',
      country: 'Singapore',
      description: 'My home',
    };

    let assignAddressToUser1 = await addAddress(user1.userId, address1);
    if (assignAddressToUser1) {
      console.log('Address successfully assigned to user: ' + user1.userId);
    }

    user1.defaultAddressId = assignAddressToUser1[0].addressId;

    // Add to user address
    const user1Address2 = {
      line1: '295 Ocean Drive',
      line2: '',
      postalCode: '098534',
      country: 'Singapore',
      description: 'My 2nd home',
    };

    let assignAddress2ToUser1 = await addAddress(user1.userId, user1Address2);
    if (assignAddress2ToUser1) {
      console.log('Address successfully assigned to user: ' + user1.userId);
    }

    for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
      await giveBadge(user1.userId, badgeControl.types.LOCAL_LOBANG);
    }
    for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
      await giveBadge(user1.userId, badgeControl.types.LOCAL_LOBANG);
    }
    for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
      await giveBadge(user1.userId, badgeControl.types.EXCELLENT_COMMUNICATOR);
    }
    for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
      await giveBadge(user1.userId, badgeControl.types.FAST_AND_FURIOUS);
    }

    await giveBadge(user1.userId, badgeControl.types.SUPER_NEIGHBOUR);

    user1.save();

    // Retrieve user 1's wallet
    const user1Wallet = await retrieveWalletByUserId(user1.userId);
    if (user1Wallet) {
      // Adding $100 balance to user 1
      const addingToUser1Wallet = await addWalletBalance(
        user1Wallet.walletId,
        100
      );
      // Check if top up was successful, alternatively can view on postman
      if (addingToUser1Wallet.balance === 100) {
        console.log('Successfully topped up user 1 wallet!');
      }
      const trans1 = await makeWithdrawal(user1Wallet.walletId, '10');
      if (trans1) {
        console.log('Withdraw $10 for user 1');
      } else {
        console.log('Failed to withdraw');
      }
      const trans2 = await makeDonation(user1Wallet.walletId, '10');
      if (trans2) {
        console.log('User 1 Make Donation $10');
      } else {
        console.log('Failed to donate');
      }
      const topup1 = await makeTopUp(
        user1Wallet.walletId,
        50,
        'OPENJIOSCRIPT0001'
      );
      if (topup1) {
        console.log('User 1 Topped up $50');
      } else {
        console.log('Failed to top up');
      }
    }

    console.log('User created with the name: ' + user1.name);

    // Second user (paul) without COVID-19 & not blacklisted

    user2 = await createUser('paul@email.com', 'password', 'Paul');
    if (user2) {
      user2.hasCovid = false;
      user2.isBlackListed = false;
      user2.strikeCount = 2;
      user2.isValidated = true;
      user2.avatarPath = './files/paul.jpg';
      user2.save();

      await giveBadge(user2.userId, badgeControl.types.LOCAL_LOBANG);

      console.log('User created with the name: ' + user2.name);
    }
    // Add to user address
    const address2 = {
      line1: '182 Stirling Road',
      line2: '#01-01',
      postalCode: '140182',
      country: 'Singapore',
      description: 'Paul home',
    };

    let assignAddressToUser2 = await addAddress(user2.userId, address2);
    if (assignAddressToUser2) {
      console.log('Address successfully assigned to user: ' + user2.userId);
    }
    user2.defaultAddressId = assignAddressToUser2[0].addressId;

    user2.save();

    // Retrieve user 2's wallet
    const user2Wallet = await retrieveWalletByUserId(user2.userId);
    if (user2Wallet) {
      // Adding $200 balance to user 1
      const addingToUser2Wallet = await addWalletBalance(
        user2Wallet.walletId,
        200
      );
      // Check if top up was successful
      if (addingToUser2Wallet.balance === 200) {
        console.log('Successfully topped up user 2 wallet!');
      }
    }

    //create past announcement1 to user1(john)
    const announcement1 = await createAnnouncement(
      user1.userId,
      assignAddressToUser1[0].addressId,
      'description 1',
      '2020-10-10T10:10:10',
      'Yio Chu Kang'
    );
    console.log(announcement1);

    // user2(Paul) send request1 to announcement1 created by user1
    const request1 = await createRequest(
      'Request1',
      'Buy Cai Fan please',
      10.0,
      announcement1.announcementId,
      user2.userId
    );
    console.log(request1);

    const complaint2 = await createComplaint(
      'Paul wanted me to buy cigarettes for him when he is underaged',
      request1.requestId,
      user1.userId
    );

    const supportTicket1 = await createSupportTicket(
      'button not working',
      'cannot create request',
      SUPPORT_TYPE.JIO,
      user1.userId
    );

    const supportTicket2 = await createSupportTicket(
      'cannot commend user',
      'the guy was very nice but i cannot commend him',
      SUPPORT_TYPE.JIO,
      user2.userId
    );

    //user1 John creates active announcement3
    const announcement3 = await createAnnouncement(
      user1.userId,
      assignAddressToUser1[0].addressId,
      'description 3',
      '2021-09-09T10:10:10',
      'Harbourfront'
    );
    console.log(announcement3);

    // user2(Paul) send request3 to announcement3 created by user1
    const request3 = await createRequest(
      'Request3',
      'Buy KFC please',
      5.0,
      announcement3.announcementId,
      user2.userId
    );
    console.log(request3);

    // Third user (tom) with COVID-19
    user3 = await createUser('tom@email.com', 'password', 'Tom');
    if (user3) {
      user3.hasCovid = true;
      user3.isBlackListed = false;
      user3.strikeCount = 2;
      user3.isValidated = true;
      user3.mobileNumber = '91253838';
      user3.avatarPath = './files/tom.jpg';
      user3.isSingPassVerified = true;
      await giveBadge(user3.userId, badgeControl.types.LOCAL_LOBANG);
    }
    const supportTicket3 = await createSupportTicket(
      'cannot change password',
      'resetted password but password did not change',
      SUPPORT_TYPE.PROFILE,
      user3.userId
    );

    // Add to user address
    const address3 = {
      line1: '183 Stirling Road',
      line2: '#03-03',
      postalCode: '140183',
      country: 'Singapore',
      description: "Mother's Home",
    };

    let assignAddressToUser3 = await addAddress(user3.userId, address3);
    if (assignAddressToUser3) {
      console.log('Address successfully assigned to user: ' + user3.userId);
    }

    let tomDefault = await addAddress(user3.userId, {
      line1: '137 Tampines Street 11',
      line2: '#03-03',
      postalCode: '521137',
      country: 'Singapore',
      description: 'Home',
    });
    user3.defaultAddressId = tomDefault[0].addressId;

    user3.save();

    //User 3 Tom creates announcement2
    const announcement2 = await createAnnouncement(
      user3.userId,
      assignAddressToUser3[0].addressId,
      'description 2',
      '2021-10-10T10:10:10',
      'Kent Ridge'
    );
    console.log(announcement2);

    // user1 john send request2 to announcement2
    const request2 = await createRequest(
      'Request2',
      'Buy Mcdonalds please',
      50.0,
      announcement2.announcementId,
      user1.userId
    );
    console.log(request2);

    const complaint1 = await createComplaint(
      'Tom ate half of my food and sent the remaining to me',
      request2.requestId,
      user1.userId
    );

    console.log(complaint1);

    // Retrieve user 3's wallet
    const user3Wallet = await retrieveWalletByUserId(user3.userId);
    if (user3Wallet) {
      // Adding $150 balance to user 1
      const addingToUser3Wallet = await addWalletBalance(
        user3Wallet.walletId,
        150
      );
      // Check if top up was successful, alternatively can view on postman
      if (addingToUser3Wallet.balance === 150) {
        console.log('Successfully topped up user 3 wallet!');
      }
    }

    console.log('User created with the name: ' + user3.name);

    // Fourth user (Mary) without COVID-19 & not blacklisted
    user4 = await createUser('mae@email.com', 'password', 'Mae');
    if (user4) {
      user4.hasCovid = false;
      user4.isBlackListed = false;
      user4.strikeCount = 0;
      user4.isValidated = true;
      user4.avatarPath = './files/mae.jpg';
      user4.save();

      await giveBadge(user4.userId, badgeControl.types.LOCAL_LOBANG);

      console.log('User created with the name: ' + user4.name);
    }
    // Add to user address
    const address4 = {
      line1: '184 Stirling Road',
      line2: '#04-04',
      postalCode: '140184',
      country: 'Singapore',
      description: 'Mae home',
    };

    let assignAddressToUser4 = await addAddress(user4.userId, address4);
    if (assignAddressToUser4) {
      console.log('Address successfully assigned to user: ' + user4.userId);
    }

    user4.defaultAddressId = assignAddressToUser4[0].addressId;

    user4.save();

    // Retrieve user 4's wallet
    const user4Wallet = await retrieveWalletByUserId(user4.userId);
    if (user4Wallet) {
      // Adding $100 balance to user 4
      const addingToUser4Wallet = await addWalletBalance(
        user4Wallet.walletId,
        100
      );
      // Check if top up was successful, alternatively can view on postman
      if (addingToUser4Wallet.balance === 100) {
        console.log('Successfully topped up user 4 wallet!');
      }
    }

    //SR3 demo announcements and requests
    //user1 John creates active announcement
    const johnAnnouncement = await createAnnouncement(
      user1.userId,
      assignAddressToUser1[0].addressId,
      `Going to buy bubble tea`,
      '2020-11-30T00:00:00.000Z',
      `Harborfront`
    );

    // #region Test requests
    await createRequest(
      'Macs',
      'Buy McSpicy please',
      10.0,
      johnAnnouncement.announcementId,
      user3.userId
    );

    // await createRequest(
    //   'bbt',
    //   'Pearl Milk Tea',
    //   3.2,
    //   johnAnnouncement.announcementId,
    //   user2.userId
    // );

    await createRequest(
      'help buy TV',
      '50"',
      10.0,
      johnAnnouncement.announcementId,
      user4.userId
    );

    //#endregion

    await createAnnouncement(
      user4.userId,
      assignAddressToUser4[0].addressId,
      `Going to collect mail`,
      '2020-11-29T00:00:00.000Z',
      `Admiralty`
    );

    await createAnnouncement(
      user2.userId,
      assignAddressToUser2[0].addressId,
      `Dapao food`,
      '2020-11-30T00:00:00.000Z',
      `Biz Canteen`
    );

    await createAnnouncement(
      user3.userId,
      assignAddressToUser3[0].addressId,
      `Grocery shopping`,
      '2020-11-30T00:00:00.000Z',
      `Seng Kang Mall`
    );

    await createAnnouncement(
      user4.userId,
      assignAddressToUser4[0].addressId,
      `Buying coffee`,
      '2020-11-30T00:00:00.000Z',
      `Starbucks`
    );

    await createAnnouncement(
      user3.userId,
      assignAddressToUser3[0].addressId,
      `Going to chalet area`,
      '2020-11-29T00:00:00.000Z',
      `Bedok`
    );

    await createAnnouncement(
      user2.userId,
      assignAddressToUser2[0].addressId,
      `Grocery shopping`,
      '2020-11-28T00:00:00.000Z',
      `West Gate`
    );

    // Create 10 users with randomly generated badge counts for leaderboard
    await Promise.all(
      [
        {email: 'jimmy@email.com', name: 'Jimmy'},
        {email: 'denise@email.com', name: 'Denise'},
        {email: 'ashburn@email.com', name: 'Ashburn'},
        {email: 'ace@email.com', name: 'Ace'},
        {email: 'sheryl@email.com', name: 'Sheryl'},
        {email: 'leeming@email.com', name: 'Lee Ming'},
        {email: 'kerry@email.com', name: 'Kerry'},
        {email: 'mary@email.com', name: 'Mary'},
        {email: 'xinyi@email.com', name: 'Xin Yi'},
        {email: 'sharina@email.com', name: 'Sharina'},
      ].map(async (user) => {
        var createdUser = await createUser(user.email, 'password', user.name);
        createdUser.isValidated = true;
        createdUser.avatarPath = `./files/${user.email.split('@')[0]}.jpg`;
        if(user.name == 'Ashburn' || user.name == 'Mary'){
          createdUser.isBlackListed = true;
          createdUser.strikeCount = 3;
        }
        await createdUser.save();
        for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
          await giveBadge(createdUser.userId, badgeControl.types.LOCAL_LOBANG);
        }
        for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
          await giveBadge(
            createdUser.userId,
            badgeControl.types.EXCELLENT_COMMUNICATOR
          );
        }
        for (let i = 1; i < Math.floor(Math.random() * 15); i++) {
          await giveBadge(
            createdUser.userId,
            badgeControl.types.FAST_AND_FURIOUS
          );
        }
        await giveBadge(createdUser.userId, badgeControl.types.SUPER_NEIGHBOUR);
      })
    ).then((res) =>
      console.log('**** [Database] Initialization Completed ****')
    );
  } catch (error) {
    console.error('****[Database] Initialization Failed:', error);
  }
};

module.exports = {
  onInitPopulateDatabase,
};
