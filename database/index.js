const {Sequelize} = require('sequelize');
const {database_variables} = require('../PRIVATE_VARIABLES');
const {
  createSuperAdmin,
  retrieveAdminByAdminId,
} = require('./Operations/Admin');
const {createUser, retrieveUserByEmail} = require('./Operations/User');
const {addAddress} = require('./Operations/Address');

const {initAddress, Address} = require('./Models/Address');
const {initAdmin, Admin} = require('./Models/Admin');
const {initAnnouncement, Announcement} = require('./Models/Announcement');
const {initBadge, Badge} = require('./Models/Badge');
const {initComplaint, Complaint} = require('./Models/Complaint');
const {initNotification, Notification} = require('./Models/Notification');
const {initOutbreakZone, OutbreakZone} = require('./Models/OutbreakZone');
const {
  initRecurrentAgreement,
  RecurrentAgreement,
} = require('./Models/RecurrentAgreement');
const {initRequest, Request} = require('./Models/Request');
const {initSupportComment, SupportComment} = require('./Models/SupportComment');
const {initSupportTicket, SupportTicket} = require('./Models/SupportTicket');
const {initTemperatureLog, TemperatureLog} = require('./Models/TemperatureLog');
const {initTransaction, Transaction} = require('./Models/Transaction');
const {initUser, User} = require('./Models/User');
const {initWallet, Wallet} = require('./Models/Wallet');
const SupportComplaintStatus = require('../enum/ComplaintStatus');
const {onInitPopulateDatabase} = require('./scripts');

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
      initRecurrentAgreement(db),
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
    Complaint.belongsTo(User, {
      as: 'complainer',
      foreignKey: 'complainerUserId',
      sourceKey: 'userId',
      constraints: false,
    }); //complaint.complainer

    // Notification
    Notification.belongsTo(User, {foreignKey: 'userId'}); //notification.userId
    User.hasMany(Notification, {foreignKey: 'userId', onDelete: 'CASCADE'}); //user.notifications

    // RecurrentAgreement
    RecurrentAgreement.belongsTo(Wallet, {foreignKey: 'walletId'}); //recurrentAgreement.walletId
    Wallet.hasMany(RecurrentAgreement, {
      foreignKey: 'walletId',
      onDelete: 'CASCADE',
    }); //wallet.recurrentAgreement

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
    User.hasMany(Complaint, {foreignKey: 'complainerUserId', onDelete: 'CASCADE'}) //user.complaints

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
        `***[Database]Database already initialized: Default Admin with type = ${admin.getDataValue(
          'adminType'
        )} and id = ${admin.getDataValue('adminId')} found`
      );
    } else {
      onInitPopulateDatabase();
    }
  } catch (error) {
    console.error(
      '***[Database] Unable to init database with default values:',
      error
    );
  }
  //#endregion

  return db;
};

module.exports = getDb;
