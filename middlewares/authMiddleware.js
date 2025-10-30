// authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Remove "Bearer " prefix if exists
    const jwtToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Verify the token and decode the data
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Attach decoded data (user info) to request object
    req.user = decoded;

    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
