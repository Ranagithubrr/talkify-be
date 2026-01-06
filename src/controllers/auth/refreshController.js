const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { signAccessToken, signRefreshToken } = require('../../utils/tokens');
const config = require('../../config');

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = refresh;
