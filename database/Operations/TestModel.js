const {TestModel} = require("../Models/TestModel");

const createTestModel = async (testId) => {
  const testModel = await TestModel.create({
    testId: testId,
  });
  return testModel;
};

const retrieveTestModel = async (testId) => {
  const testModel = await TestModel.findOne({
    where: {
      testId: testId,
    },
  });
  return testModel;
};

module.exports = {
    createTestModel,
    retrieveTestModel
}