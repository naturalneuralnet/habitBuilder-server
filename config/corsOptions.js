// http://localhost:3000
// https://habitmaker.onrender.com
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
  credentials: true,

  optionsSuccessStatus: 200,
};

export default corsOptions;
