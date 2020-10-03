const {Sequelize} = require('sequelize');
const {database_variables} = require('../PRIVATE_VARIABLES');
const {
  createSuperAdmin,
  retrieveAdminByAdminId,
  retrieveAdminByEmail,
} = require('./Operations/Admin');
const {createUser, retrieveUserByEmail} = require('./Operations/User');
const {addAddress} = require('./Operations/Address');

const {initTestModel, TestModel} = require('./Models/TestModel');
const {initAddress, Address} = require('./Models/Address');
const {initAdmin, Admin} = require('./Models/Admin');
const {initAnnouncement, Announcement} = require('./Models/Announcement');
const {initBadge, Badge} = require('./Models/Badge');
const {initComplaint, Complaint} = require('./Models/Complaint');
const {initNotification, Notification} = require('./Models/Notification');
const {initOutbreakZone, OutbreakZone} = require('./Models/OutbreakZone');
const {initRecurrentTopUp, RecurrentTopUp} = require('./Models/RecurrentTopUp');
const {initRequest, Request} = require('./Models/Request');
const {initSupportComment, SupportComment} = require('./Models/SupportComment');
const {initSupportTicket, SupportTicket} = require('./Models/SupportTicket');
const {initTemperatureLog, TemperatureLog} = require('./Models/TemperatureLog');
const {initTransaction, Transaction} = require('./Models/Transaction');
const {initUser, User} = require('./Models/User');
const {initWallet, Wallet} = require('./Models/Wallet');
const SupportComplaintStatus = require('../enum/SupportComplaintStatus');
const {createUser, retrieveUserByUserId} = require('./Operations/User');

let db;

const getDb = async () => {
  if (db) {
    await db.sync();
    return db;
  }

  db = new Sequelize(
    database_variables.database,
    database_variables.username,
    database_variables.password,
    {
      host: 'localhost',
      dialect: 'mysql',
    }
  );

  //#region Authenticate
  try {
    await db.authenticate();
    console.log(
      '***[Database] Connection to database has been established successfully.'
    );
  } catch (error) {
    console.error('***[Database] Unable to connect to the database:', error);
  }
  //#endregion

  //#region  Init Models
  try {
    await Promise.all([
      initAddress(db),
      initAdmin(db),
      initAnnouncement(db),
      initBadge(db),
      initComplaint(db),
      initNotification(db),
      initOutbreakZone(db),
      initRecurrentTopUp(db),
      initRequest(db),
      initSupportComment(db),
      initSupportTicket(db),
      initTemperatureLog(db),
      initTransaction(db),
      initUser(db),
      initWallet(db),
    ]);
  } catch (error) {
    console.error('***[Database] Unable to initialize database:', error);
  }
  //#endregion

  //#region Set Up Relationship
  try {
    /*
      a.hasOne(b) -> foreign key is on b (ie, b.a is possible)
      a.belongsTo(b) -> fk is on a (ie, a.b is possible)
      a.hasMany(b) -> foreign key is on b (ie, b.a is possible, a.b not shown in db but can be obtained by getters or eager loading)
      a.belongsToMany(b) -> creates a join table (need to do on both sides for many:many so a.b and b.a both possible)
    */

    // Address
    Address.belongsTo(User, {foreignKey: 'userId'}); //address.userId

    // Admin
    Admin.hasMany(SupportComment, {
      foreignKey: 'adminId',
      onDelete: 'SET NULL',
    }); //admin.supportComments

    // Announcement
    Announcement.belongsTo(User, {foreignKey: 'userId'}); //announcement.userId
    Announcement.hasMany(Request, {
      foreignKey: 'announcementId',
      onDelete: 'SET NULL',
    }); //announcement.requests

    // Badge
    Badge.belongsTo(User, {foreignKey: 'userId'}); //badge.userId

    // Complaint
    Complaint.belongsTo(Request, {foreignKey: 'requestId'}); //complaint.requestId

    // Notification
    Notification.belongsTo(User, {foreignKey: 'userId'}); //notification.userId
    User.hasMany(Notification, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.notifications

    // RecurrentTopUp
    RecurrentTopUp.belongsTo(Wallet, {foreignKey: 'walletId'}); //recurrentTopUp.walletId
    Wallet.hasOne(RecurrentTopUp, {
      foreignKey: 'walletId',
      onDelete: 'CASCADE',
    }); //wallet.recurrentTopUp

    // Request
    Request.belongsTo(Announcement, {foreignKey: 'announcementId'}); //request.announcement
    Request.hasMany(Complaint, {foreignKey: 'requestId', onDelete: 'CASCADE'}); //request.complaints
    Request.belongsTo(User, {foreignKey: 'userId'}); //request.userId

    // SupportComment
    SupportComment.belongsTo(Admin, {foreignKey: 'adminId'}); //supportComment.adminid
    SupportComment.belongsTo(SupportTicket, {foreignKey: 'supportTicketId'}); //supportComment.supportTicketId

    // SupportTicket
    SupportTicket.hasMany(SupportComment, {
      foreignKey: 'supportTicketId',
      onDelete: 'CASCADE',
    }); //supportTicket.supportComments
    SupportTicket.belongsTo(User, {foreignKey: 'userId'}); //supportTicket.userId

    // TemperatureLog
    TemperatureLog.belongsTo(User, {foreignKey: 'userId'}); //temperatureLog.userId

    // Transaction
    Transaction.belongsTo(Wallet, {
      as: 'senderWallet',
      foreignKey: 'senderWalletId',
      sourceKey: 'walletId',
      constraints: false,
    }); //transaction.senderWallet
    Transaction.belongsTo(Wallet, {
      as: 'recipientWallet',
      foreignKey: 'recipientWalletId',
      sourceKey: 'walletId',
      constraints: false,
    }); //transaction.recipientWallet

    // User
    User.hasMany(Address, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.addresses
    User.belongsTo(Address, {
      as: 'defaultAddress',
      foreignKey: 'defaultAddressId',
      sourceKey: 'addressId',
      constraints: false,
    }); //user.defaultAddress
    User.hasMany(Announcement, {foreignKey: 'userId', onDelete: 'SET NULL'}); //user.announcements
    User.hasMany(Badge, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.badges
    User.hasMany(Request, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.requests
    User.hasMany(SupportTicket, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.supportTickets
    User.hasMany(TemperatureLog, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.temperatureLogs
    User.hasOne(Wallet, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.wallet

    // Wallet
    Wallet.belongsTo(User, {foreignKey: 'userId'}); // wallet.userId
    Wallet.hasMany(Transaction, {
      as: 'senderTransactions',
      foreignKey: 'senderWalletId',
      sourceKey: 'walletId',
    }); //wallet.senderTransactions
    Wallet.hasMany(Transaction, {
      as: 'recipientTransactions',
      foreignKey: 'recipientWalletId',
      sourceKey: 'walletId',
    }); //wallet.recipientTransations

    await db.sync();
  } catch (error) {
    console.error('***[Database] Unable to set up relationship:', error);
  }
  //#endregion

  //#region Insert TestModel
  // Change to Admin user when schema is out please
  try {
    let admin = await retrieveAdminByAdminId('1');
    if (admin) {
      //admin found
      console.log(
        `***[Database] Default Admin with type = ${admin.getDataValue(
          'adminType'
        )} and id = ${admin.getDataValue('adminId')} found`
      );
    } else {
      admin = await createSuperAdmin(
        '1',
        'superadmin',
        'superadmin@openjio.com',
        'password'
      );
      console.log(
        `***[Database] Admin with id ${admin.getDataValue('adminId')} created`
      );
    }
  } catch (error) {
    console.error('***[Database] Unable to insert default user:', error);
  }

  // Populating user
  try {
    // First user (John) with COVID-19 & not blacklisted
    let user1Populated = await retrieveUserByEmail('john123@gmail.com');

    if (user1Populated) {
      console.log('User1 already created');
    } else {
      user1 = await createUser('john123@gmail.com', 'password', 'john');
      if (user1) {
        user1.hasCovid = true;
        user1.isBlackListed = false;
        user1.strikeCount = 1;

        // Add to user address
        const address1 = {
          line1: '181 Stirling Road',
          line2: '#12-34',
          postalCode: '140181',
          country: 'Singapore',
          description: 'My home',
        };

        let assignAddressToUser = await addAddress(user1.userId, address1);
        if (assignAddressToUser) {
          console.log('Address successfully assigned to user: ' + user1.userId);
        }

        user1.save();
        console.log('User created with the name: ' + user1.name);
      }
    }

    // Second user (paul) without COVID-19 & not blacklisted
    let user2Populated = await retrieveUserByEmail('paul@gmail.com');

    if (user2Populated) {
      console.log('User2 already created');
    } else {
      user2 = await createUser('paul@gmail.com', 'password', 'paul');
      if (user2) {
        user2.hasCovid = false;
        user2.isBlackListed = false;
        user2.strikeCount = 2;
        user2.save();
        console.log('User created with the name: ' + user2.name);
      }
    }

    // Third user (tom) with COVID-19
    let user3Populated = await retrieveUserByEmail('tom@gmail.com');

    if (user3Populated) {
      console.log('User3 already created');
    } else {
      user3 = await createUser('tom@gmail.com', 'password', 'tom');
      if (user3) {
        user3.hasCovid = true;
        user3.isBlackListed = true;
        user3.strikeCount = 3;
        // Add to user address
        const address3 = {
          line1: '21 Heng Mui Keng Terrace',
          line2: 'Icube Building',
          postalCode: '119613',
          country: 'Singapore',
          description: 'Best place in NUS',
        };

        let assignAddressToUser = await addAddress(user3.userId, address3);
        if (assignAddressToUser) {
          console.log('Address successfully assigned to user: ' + user3.userId);
        }

        user3.save();
        console.log('User created with the name: ' + user3.name);
      }
    }
  } catch (error) {
    console.error('***[Database] Unable to insert user:', error);
  }

  //#endregion

  return db;
};

module.exports = getDb;
