const { Sequelize } = require("sequelize");
const { database_variables } = require("../PRIVATE_VARIABLES");
const {
  createTestModel,
  retrieveTestModel,
} = require("./Operations/TestModel");
const {initTestModel} = require('./Models/TestModel')

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

  // Authenticate
  try {
    await db.authenticate();
    console.log(
      "***[Database] Connection to database has been established successfully."
    );
  } catch (error) {
    console.error("***[Database] Unable to connect to the database:", error);
  }

  // Init Models
  try {
    await initTestModel(db);
  } catch (error) {
    console.error("***[Database] Unable to initialize database:", error);
  }

  // Insert TestModel
  // Change to Admin user when schema is out please
  try {
    let admin = await retrieveTestModel('1')
    if(admin){
        //admin found
        console.log(`***[Database] Admin with id ${admin.getDataValue('testId')} found`)
    }else {
        admin = await createTestModel('1');
        console.log(`***[Database] Admin with id ${admin.getDataValue('testId')} created`)
    }
    
  } catch (error) {
    console.error("***[Database] Unable to insert TestModel:", error);
  }

  return db;
};

module.exports = getDb;
