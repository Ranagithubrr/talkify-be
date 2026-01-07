const User = require('../models/User');

async function listUsers(req, res, next) {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
};
