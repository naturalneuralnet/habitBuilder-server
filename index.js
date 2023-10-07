import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
//import clientRoutes from "./routes/client.js";
import userRoutes from "./routes/user.js";
import habitRoutes from "./routes/habit.js";
import authRoutes from "./routes/auth.js";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { logEvents, logger } from "./middleware/logger.js";

// CONFIGURATION
dotenv.config();
// use express for the app
const app = express();
app.use(logger);
// use json
app.use(express.json());
// use helmet to protect api?
//app.use(helmet());
//app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// use morgan for something
app.use(morgan("common"));
// body parser to parse objects?
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// use cors
app.use(cors(corsOptions));

//// ROUTES // splitting the enpoints
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/habits", habitRoutes);

/// MONGOOSE SETUP
/// use the error logger at the end

app.use(errorHandler);
const PORT = process.env.PORT || 9000; // backup port if needed
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
