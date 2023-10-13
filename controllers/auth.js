import User from "../models/User.js";
import Habit from "../models/Habit.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import sendConfirmationEmail from "../config/nodeMailerConfig.js";
// import { deleteHabitsByUserID } from "./habit.js";

// @desc Login
// @route POST /auth
// @access Public is public

// adding a check to see if the user is active before logging in
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  /// check for username and password
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  /// chec if the user exists
  const foundUser = await User.findOne({ username }).exec();

  // if the user is not found or if the user is inactive
  // this should be two separate checks, if the user is found and if the user is active or pending
  if (!foundUser || foundUser.status === "Pending") {
    return res
      .status(401)
      .json({ message: "Pending Account: Please Verify Your Email." });
  }

  // if the user does exists, then see if the password matches the one in the database
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match)
    return res
      .status(401)
      .json({ message: "Unauthorized because passwords don't match" });

  /// create access token
  /// jwt.sign to create the access token
  const accessToken = jwt.sign(
    /// contains object
    /// user information is inserted
    /// will need to be destructured in the front end/
    // uses the access token secret in here
    /// 10 seconds expiry to test it
    {
      UserInfo: {
        userId: foundUser._id,
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  /// create refresh token
  /// save as above
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  /// refresh token is used to create a cookie response, anming it jwt
  res.cookie("jwt", refreshToken, {
    /// options for cookie
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie - we do want to allow crosssite cookie becuase different hosts for front and back end
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match the refresh token - 1 day 7 days a week
  });

  // Send accessToken containing username and roles
  /// sends back the access token , so the client recieves the accesstoken,
  /// the server sets the cookie
  /// the client never handles the refersh token
  /// but make sure that when the client sends a request to teh refresh endpoint, this cookie is sent with it

  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired

///this needs to be public so they can get a valid referesh token
export const refresh = async (req, res) => {
  const cookies = req.cookies;

  /// expecting a cookie with the request,
  /// if we don't have a cookie then send error
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  /// set the refresh token variable to that cookie
  const refreshToken = cookies.jwt;
  /// use jwt to verify the refresh token
  // pass in the refresh token vairaibale and the refresh token secret
  /// pass in asynchahnlder to chek for errors in the verify process
  /// send a 403 forbidden response
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      /// check if we have the user inside the refresh token
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      /// if we dont then unauthorized
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
      /// create a new access token with the user names and roles
      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser._id,
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      /// respond with the access token

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists

// its public to clear a cookie
export const logout = async (req, res) => {
  /// check for cookies
  const cookies = req.cookies;
  /// if no cookie
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  /// clear cookie to remove cookie when the user decides to manually logout
  /// have to pass in the same options as when creating the cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  /// resposne
  res.json({ message: "Cookie cleared" });
};

// @desc SignUp
// @route POST /auth/signup
// @access Public - to sign up

export const signup = async (req, res) => {
  const { username, pwd, userEmail } = req.body;

  // check if the data is there, check if roles is an array and has a lenght
  if (!username || !pwd) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates, no two users with the same username
  // if you want to recieve a promise then you need to use exec
  // const duplicateUsername = await User.findOne({ username })
  //   .collation({ locale: "en", strength: 2 })
  //   .lean()
  //   .exec();

  // if (duplicateUsername) {
  //   return res.status(409).json({ message: "Duplicate Username" });
  // }

  const duplicateEmail = await User.findOne({ email: userEmail })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateEmail) {
    console.log("duplicate email");
    return res.status(409).json({ message: "Duplicate Email" });
  }

  /// hash the password
  const hashedPwd = await bcrypt.hash(pwd, 10);

  /// create and store new user

  const token = jwt.sign(
    { email: req.body.userEmail },
    process.env.USER_VERIFICATION_SECRET
  );

  /// if there is nor roles object then create the user without it
  const userObject = {
    username,
    password: hashedPwd,
    email: userEmail,
    confirmationCode: token,
  };

  /// create the user and send the confirmation email
  const user = await User.create(userObject);

  if (!user) {
    res.status(500).json({ message: "Unable to create user" });
  } else {
    const sender = process.env.VERIFICATION_EMAIL;

    const pass = process.env.VERIFICATION_EMAIL_PASS;
    console.log("EMAIL IS STILL SENT");
    sendConfirmationEmail(
      sender,
      pass,
      user.username,
      user.email,
      user.confirmationCode
    );
    res.status(200).json({
      message: "User was registered successfully! Please check your email.",
    });
  }
};

// @desc verify or Confirm the user
// @route GET /auth/confirm/:Confirmation Code
// @access Public - to confirm the code

export const verify = async (req, res) => {
  // console.log("INSIDE VERIFY");
  // console.log(req.params);
  // const { confirmationCode } = req.params;
  // console.log(confirmationCode);

  const user = await User.findOne({
    confirmationCode: req.params.confirmationCode,
  });

  //console.log(findUser);

  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  user.status = "Active";
  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} account verified.` });
};

// @desc SignUp
// @route POST /auth/guest
// @access Public - for guest usage
export const guest = async (req, res) => {
  const { username, pwd, userEmail } = req.body;
  console.log(pwd);

  /// hash the password
  const hashedPwd = await bcrypt.hash(pwd, 10);

  // const token = jwt.sign(
  //   { email: req.body.userEmail },
  //   process.env.USER_VERIFICATION_SECRET
  // );

  const today = new Date(); // get today's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Add 1 to today's date and set it to tomorrow

  // today.setMinutes(today.getMinutes() + 10);

  /// if there is nor roles object then create the user without it
  const userObject = {
    username,
    password: hashedPwd,
    email: userEmail,
    confirmationCode: token,
    status: "Active",
    roles: "guest",
    expireAt: tomorrow,
  };

  // /// create the user and send the confirmation email
  const user = await User.create(userObject);

  /// chec if the user exists
  const foundUser = await User.findOne({ username }).exec();

  setTimeout(() => {
    const result = deleteHabitsByUserID({ userID: foundUser._id });
    console.log("Habits Deleted");
  }, 1000 * 60 * 24);

  /// create access token
  /// jwt.sign to create the access token
  const accessToken = jwt.sign(
    /// contains object
    {
      UserInfo: {
        userId: foundUser._id,
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  /// create refresh token
  /// save as above
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "5h" }
  );

  // Create secure cookie with refresh token
  /// refresh token is used to create a cookie response, anming it jwt
  res.cookie("jwt", refreshToken, {
    /// options for cookie
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie - we do want to allow crosssite cookie becuase different hosts for front and back end
    maxAge: 5 * 60 * 60 * 1000, //cookie expiry: set to match the refresh token - 1 day 7 days a week
  });

  if (!user) {
    res.status(500).json({ message: "Unable to create guest" });
  } else {
    res.status(200).json({
      accessToken,
      message: "Guest was created successfully",
    });
  }
};

const deleteHabitsByUserID = asyncHandler(async (req, res) => {
  const { userID } = req;

  //confirm habit exists

  const habits = await Habit.find({ user: userID });

  for (let i = 0; i < habits.length; i++) {
    habits[i].deleteOne();
  }

  const reply = `Habits deleted`;

  return reply;
});
