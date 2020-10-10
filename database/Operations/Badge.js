const {Badge} = require('../Models/Badge');
const {User} = require('../Models/User');

const badgeControl = require('../../enum/BadgeControl');
const {retrieveUserByUserId} = require('./User');
/*
  Create an insert a badge into database
  Parameters: (
    userId: string, 
    badge: {
      name: string,
      badgeType: string,
      description: string
    } // refer to BadgeControl
)
  Return: badge object
*/
const createBadge = async (userId, badge) => {
  try {
    const newBadge = Badge.build({
      name: badge.name,
      description: badge.description,
      badgeType: badge.badgeType,
      userId: userId,
    });

    return await newBadge.save();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Create an insert a badge into database
  Parameters: (userId: string)
  Return: badge object
*/
const populateBadgesOnUserCreation = async (userId) => {
  try {
    const newBadges = await Promise.all(
      badgeControl.badges.map((badge) => {
        createBadge(userId, badge);
      })
    );
    console.log(newBadges);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/*
  Find a particular badge that belongs to a user 
  Parameters: (userId: string, badgeType: string)
  Return: badge object
*/
const retrieveBadgeByUserIdAndBadgeType = async (userId, badgeType) => {
  try {
    if (!badgeControl.types[badgeType]) {
      throw 'This badge does not exist';
    }
    var badge = await Badge.findOne({
      where: {
        userId,
        badgeType,
      },
    });

    if (!badge) {
      badge = await createBadge(
        userId,
        badgeControl.badges.find((badge) => badge.badgeType === badgeType)
      );
    }

    return badge;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const resetMonthlyBadgeCounts = async () => {
  await Promise.all([
    User.update({badgeCountMonthly: 0}, {where: {}}),
    Badge.update({monthlyCounter: 0}, {where: {}}),
  ]) 
}

module.exports = {
  populateBadgesOnUserCreation,
  retrieveBadgeByUserIdAndBadgeType,
  resetMonthlyBadgeCounts
};
