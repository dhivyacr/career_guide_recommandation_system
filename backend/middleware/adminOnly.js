const ADMIN_EMAIL = "admin@bitsathy.ac.in";

function adminOnly(req, res, next) {
  if (!req.user || req.user.email !== ADMIN_EMAIL || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  return next();
}

module.exports = adminOnly;
