const authMiddleware = require("./authMiddleware");

function verifyFaculty(req, res, next) {
  return authMiddleware(req, res, () => {
    if (!req.user || !["faculty", "mentor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access only" });
    }

    return next();
  });
}

module.exports = verifyFaculty;
