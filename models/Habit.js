import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
    },
    year: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", HabitSchema);
export default Habit;
