import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import passport from "passport";
import passportJWT from "passport-jwt";
// import bcrypt from "bcryptjs";

import userModel from "../models/userModel";

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await userModel.findById(jwtPayload._id);
      return done(null, user);
    } catch (error) {
      done(error, false);
    }
  })
);

export default passport;
