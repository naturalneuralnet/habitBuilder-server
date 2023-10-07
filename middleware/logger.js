import format from "date-fns/format/index.js";

import { v4 } from "uuid";
// const { v4: uuid } = require("uuid");
// file system from node
import fs from "fs";
// file system promises from node
import fsPromises from "fs/promises";
//const fsPromises = require("fs").promises;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const logEvents = async (message, logFileName) => {
  // datetime variable
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  /// template literal that has a unique user id , date time and the log message
  /// /t is tab, uuid creates a unique id for each item
  /// \n creates a new line
  const logItem = `${dateTime}\t${v4()}\t${message}\n`;

  try {
    // this will check if the logs folder exists and create it if it doesn't
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    /// adds the log to the log file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

/// middlware has access to reqeust response and next so it can move onto the next piece of middleware
const logger = (req, res, next) => {
  // calling the function above and logging the request data
  // .log is a text file
  // could add conditionals so it doesn't log every request
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  // moves onto the next piece of middlware
  next();
};

export { logger, logEvents };
