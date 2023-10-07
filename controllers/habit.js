import User from "../models/User.js";
import Habit from "../models/Habit.js";

import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// @desc get habits by user id
// @route delete /habit/:id
// @access Private

// export const getHabitsByUserID = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const habits = await Habit.find({ user: id });
//   console.log(habits);
//   if (!habits) {
//     return res.status(304).json({ message: "Habits not found" });
//   } else {
//     return res.status(200).json(habits);
//   }
// });

export const getHabitsSimple = async (req, res) => {
  try {
    const { id } = req.params;
    const habits = await Habit.find({ user: id });
    res.status(200).json(habits);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getHabitsByUserID = async (req, res) => {
  try {
    // get the user id
    const { id } = req.params;
    console.log(id);
    /// get all the habits
    const habits = Habit.find({ user: id });

    res.status(200).json(habits);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createHabit = asyncHandler(async (req, res) => {
  const { name, user } = req.body;

  console.log(name, user);
  /// check if the dat is there
  if (!name || !user) {
    res.status(400).json({ message: "All fields required" });
  }

  // check for duplicate with userid.
  const duplicate = await Habit.findOne({ name, user }).lean().exec();
  console.log(duplicate);
  if (duplicate) {
    res.status(409).json({ message: "A habit with this name already exists" });
  }

  const habitObject = {
    name: name,
    user: user,
    year: [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  };

  const habit = await Habit.create(habitObject);

  if (habit) {
    res.status(201).json({ message: `New habit ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid Habit Data recieved" });
  }
});

export const updateHabit = asyncHandler(async (req, res) => {
  const { id, user, name, year } = req.body;

  if (!id || !name || !user || !year) {
    res.status(400).json({ message: "All fields required" });
  }

  ///check for duplicates
  const duplicate = await Habit.findOne({ id, user });

  // check if the duplicate is the original habit or a different habit with the same name
  // allows update for the original habit
  // if a duplicate exists and the duplicate id does not match the habit to update's id,
  //then this is a duplicate habit and not the original we want to update
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(400).json({ message: "Duplicate username" });
  }

  /// get the habit you need to update
  const habit = await Habit.findById(id).lean().exec();
  console.log(habit);

  if (!habit) {
    return res.status(400).json({ message: "Habit not found" });
  }

  /// update it
  habit.name = name;
  habit.user = user;
  habit.year = year;

  /// save the updated user

  const updatedHabit = await Habit.findOneAndUpdate(
    { _id: id },
    {
      name: name,
      user: user,
      year: year,
    }
  );

  if (updatedHabit) {
    res.status(200).json({ message: `${name} updated` });
  } else {
    res.status(400).json({ message: `could not create habit` });
  }
});

export const deleteHabit = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Habit ID required" });
  }

  //confirm habit exists
  const habit = await Habit.findById(id).exec();

  if (!habit) {
    return res.status(400).json({ message: "Habit not found" });
  }

  const result = await habit.deleteOne();

  const reply = `Habit '${result.name}' with ID ${result._id} deleted`;

  res.json(reply);
});

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
