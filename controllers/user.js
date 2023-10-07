import User from "../models/User.js";
import Habit from "../models/Habit.js";

import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
// @desc Get user by id
// @route GET /user/:id
// @access Private

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc Get all users
// @route GET /user
// @access Private
export const getAllUsers = asyncHandler(async (req, res) => {
  // lean tells it to give us data that is like json and the select - password
  // ensures it does not return the password
  const users = await User.find().select("-password").lean();

  /// checks the length of users if users is defined
  if (!users?.length) {
    res.status(400).json({ message: "No users found" });
  }
  res.status(200).json(users);
});

// @desc post user by id
// @route POST /user
// @access Private
export const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // check if the data is there, check if roles is an array and has a lenght
  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
  }

  // check for duplicates, no two users with the same username
  // if you want to recieve a promise then you need to use exec
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    res.status(400).json({ message: "Duplicate Username" });
  }

  /// hash the password
  const hashedPwd = await bcrypt.hash(password, 10);

  /// create and store new user

  /// if there is nor roles object then create the user without it
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };

  const user = await User.create(userObject);

  if (user) {
    res.status(200).json({ message: `New User ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// @desc update user by id
// @route PUT /user
// @access Private
export const updateUser = asyncHandler(async (req, res) => {
  /// get updated user data
  const { id, password, username, roles, active } = req.body;

  // check the data
  if (
    !id ||
    !password ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== boolean
  ) {
    res.status(400).json({ message: "All fields are required" });
  }

  // find the user to update
  const user = await User.findByID(id).exec();

  if (!user) {
    res.status(400).json({ message: "User not found" });
  }

  /// check for duplicate

  const duplicate = await User.findOne({ username }).lean().exec();

  // check if the duplicate is the original user or a different user with the same username
  // allows update for the original user
  // if a duplicate exists and the duplicate id does not match the user to update's id,
  //then this is a duplicate user and not the original we want to update
  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(400).json({ message: "Duplicate username" });
  }

  // update the user with the new data
  user.username = username;
  user.roles = roles;
  user.active = active;

  // update the password if it exists
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  /// save the updated user

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc delete user by id
// @route delete /user
// @access Private
export const deleteUser = asyncHandler(async (req, res) => {
  /// get the user id

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  /// check if the user has habits,
  /// users who have habits cannot be deleted

  const habit = await Habit.findOne({ user: id }).lean().exec();
  if (!habit) {
    return res.status(400).json({ message: "User has habits" });
  }

  const userHabits = await Habit.find({ user: id });

  for (let i = 0; i < cars.length; i++) {
    await userHabits[i].deleteOne();
  }

  /// find the user

  const user = await Habit.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Habit not found" });
  }

  const result = await user.deleteOne();

  /// need to delete all the habits too

  const reply = `Username ${result.username} with ID ${result._id} deleted. 
  All the users habits were deleted `;

  res.json(reply);
});

/// ideal habit strucutre
// {
//   name: "Journaling"
//   years: {
//     {year: "2023",
//   percent: "0",
//   january: [],
//   febuary: [],
// }
//   }
// }

export const getHabitsComplex = async (req, res) => {
  try {
    // get the user id
    const { id } = req.params;
    const user = await User.findById(id);

    /// get all the habits
    const habits = Habit.findById(id);

    /// get all the years for each habit
    /// loop through habits get the id
    /// get the year that has that id
    /// add the year to a dicttionary
    /// maybe using object keys
    const years = [];

    const joinedYears = habits.reduce((acc, { yearID }) => {
      years.push(Years.findById(yearID));
      return acc;
    }, {});

    /// object enteries example

    /// one more loop to format it needed for nivo chartes
    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
