const { Sequelize } = require("sequelize");
const { database_variables } = require("../PRIVATE_VARIABLES");
const { createSuperAdmin, retrieveAdminById } = require('./Operations/Admin')
const { initTestModel, TestModel } = require("./Models/TestModel");
const { initAddress, Address } = require("./Models/Address");
const { initAdmin, Admin } = require("./Models/Admin");
const { initAnnouncement, Announcement } = require("./Models/Announcement");
const { initBadge, Badge } = require("./Models/Badge");
const { initComplaint, Complaint } = require("./Models/Complaint");
const { initNotification, Notification } = require("./Models/Notification");
const { initOutbreakZone, OutbreakZone } = require("./Models/OutbreakZone");
const { initRecurrentTopUp, RecurrentTopUp } = require("./Models/RecurrentTopUp");
const { initRequest, Request } = require("./Models/Request");
const { initSupportComment, SupportComment } = require("./Models/SupportComment");
const { initSupportTicket, SupportTicket } = require("./Models/SupportTicket");
const { initTemperatureLog, TemperatureLog } = require("./Models/TemperatureLog");
const { initTransaction, Transaction } = require("./Models/Transaction");
const { initUser, User } = require("./Models/Users");
const { initWallet, Wallet } = require("./Models/Wallet");


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
      host: "localhost",
      dialect: "mysql",
    }
  );

  //#region Authenticate
  try {
    await db.authenticate();
    console.log(
      "***[Database] Connection to database has been established successfully."
    );
  } catch (error) {
    console.error("***[Database] Unable to connect to the database:", error);
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
        initWallet(db)
    ]);
  } catch (error) {
    console.error("***[Database] Unable to initialize database:", error);
  }
  //#endregion

  //#region Set Up Relationship
  //#region

  //#region Insert TestModel
  // Change to Admin user when schema is out please
  try {
    let admin = await retrieveAdminById("1");
    if (admin) {
      //admin found
      console.log(
        `***[Database] Default Admin with type = ${admin.getDataValue("adminType")} and id = ${admin.getDataValue("adminId")} found`
      );
    } else {
      admin = await createSuperAdmin("1", "superadmin", "superadmin@openjio.com", "password");
      console.log(
        `***[Database] Admin with id ${admin.getDataValue("adminId")} created`
      );
    }
  } catch (error) {
    console.error("***[Database] Unable to insert default Super Admin:", error);
  }
  //#endregion

  return db;
};

module.exports = getDb;
