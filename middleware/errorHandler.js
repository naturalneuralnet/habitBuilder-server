import { logEvents } from "./logger.js";

/// overwrites expresses native errorhandler
const errorHandler = (err, req, res, next) => {
  /// will log errors to a file called errorLog
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  // gives us where the error is
  console.log(err.stack);

  //will send the response status code otherwise it will send err 500
  const status = res.statusCode ? res.statusCode : 500; // server error

  res.status(status);
  res.json({ message: err.message, isError: true });
};

export { errorHandler };
