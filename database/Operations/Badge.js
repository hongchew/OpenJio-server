const {Badge} = require('../Models/Badge');
const badgeControl = require('../../enum/BadgeControl');

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
    const newBadges = await Promise.all(badgeControl.badges.map((badge) => {
      createBadge(userId, badge);
    }));
    console.log(newBadges);

  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  populateBadgesOnUserCreation,
}