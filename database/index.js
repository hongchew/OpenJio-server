const { Sequelize } = require("sequelize");
const { database_variables } = require("../PRIVATE_VARIABLES");
const { createSuperAdmin, retrieveAdminById } = require('./Operations/Admin')
const { initTestModel, TestModel } = require("./Models/TestModel");
const { initAdmin, Admin } = require("./Models/Admin");

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
    await Promise.all([initTestModel(db), initAdmin(db)]);
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
        `***[Database] Default Admin with type = ${admin.getDataValue("adminType")} and id = ${admin.getDataValue("id")} found`
      );
    } else {
      admin = await createSuperAdmin("1", "superadmin", "superadmin@openjio.com", "password");
      console.log(
        `***[Database] Admin with id ${admin.getDataValue("id")} created`
      );
    }
  } catch (error) {
    console.error("***[Database] Unable to insert default Super Admin:", error);
  }
  //#endregion

  return db;
};

module.exports = getDb;
