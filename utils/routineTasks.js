const {Badge} = require('../database/Models/Badge');
const {User} = require('../database/Models/User');
const {giveBadge, retrieveLeaderboard} = require('../database/Operations/User');
const badgeControl = require('../enum/BadgeControl');

//#region MONTHLIES
const resetMonthlyBadgeCounts = async () => {
  return Promise.all([
    User.update({badgeCountMonthly: 0}, {where: {}}),
    Badge.update({monthlyCounter: 0}, {where: {}}),
  ]);
};

const giveSuperNeighbourBadge = async () => {
  // retrieve top collector of the month
  const leaderboard = await retrieveLeaderboard('MONTHLY');
  const superNeighbour = leaderboard[0];
  console.log(
    `\n*** Awarding to: userId: ${superNeighbour.userId}, name: ${superNeighbour.name}\n`
  );
  // give badge
  return giveBadge(superNeighbour.userId, badgeControl.types.SUPER_NEIGHBOUR);
};

const doMonthlyTasks = async () => {
  console.log('\n*** MONTHLY SCHEDULED OPERATIONS START ***\n');
  console.log(`Current timestamp: ${new Date().getTime()}`);
  console.log('\n*** Awarding Super Neighbour ... ***');

  return giveSuperNeighbourBadge()
    .then(() => {
      console.log('*** Super Neighbour awarded ***');
      console.log('\n*** Reseting monthly leaderboard ... ***');

      return resetMonthlyBadgeCounts();
    })
    .then(() => {
      console.log('*** Reset Completed ***');
      console.log('\n*** MONTHLY SCHEDULED OPERATIONS ENDS ***\n');
    })
    .catch((e) => {
      throw e;
    });
};
//#endregion

module.exports = {
  doMonthlyTasks,
};
