const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../model/user.js');
const passportConfig = () => {
  const opt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
  };

  passport.use(
    new Strategy(opt, async (jwt_payload, done) => {
      const user = await User.findById(jwt_payload.sub);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
  );
};
module.exports = passportConfig;
