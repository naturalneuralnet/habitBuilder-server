// http://localhost:3000
const allowedOrigins = ["https://habitmaker.onrender.com"];

const corsOptions = {
  origin: (origin, callback) => {
    // checks if the orgin is in the allowed list or has no origin to allow postman to work for testing
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  /// sets the allow credentials header
  credentials: true,
  /// usually this is 204 but some devices have errors on 204
  optionsSuccessStatus: 200,
};

export default corsOptions;
//module.exports = corsOptions;
