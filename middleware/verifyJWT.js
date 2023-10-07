import jwt from "jsonwebtoken";

/// middleware so it recieves a request, sends response and passes onto next
const verifyJWT = (req, res, next) => {
  /// authHeader - check if the request has an authheader

  const authHeader = req.headers.authorization || req.headers.Authorization;
  /// the value inside authHeader should always start with the word Bearer with a apitol B followed by a space

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  /// grab the access token, by splitting the sring in authheader and take the second value

  const token = authHeader.split(" ")[1];
  /// we pass the token into the jwt verify mehtod, with our acess token secret
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // if error
    if (err) return res.status(403).json({ message: "Forbidden" });
    /// then we have a request with the decoded user and roles
    // then we call next which will move this request ont to the next
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

export { verifyJWT };
