const User = require("../../models/User");
const Career = require("../../models/Career");

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ total: users.length, users });
  } catch (error) {
    return next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const [totalUsers, totalStudents, totalAdmins, totalCareers, recentUsers, completedProfilesAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      Career.countDocuments(),
      User.find({}).select("name email role education skills interests createdAt").sort({ createdAt: -1 }).limit(5),
      User.aggregate([
        { $match: { role: "student" } },
        {
          $project: {
            isComplete: {
              $and: [
                { $gt: [{ $strLenCP: { $ifNull: ["$education", ""] } }, 0] },
                { $gt: [{ $size: { $ifNull: ["$skills", []] } }, 0] },
                { $gt: [{ $size: { $ifNull: ["$interests", []] } }, 0] }
              ]
            }
          }
        },
        { $match: { isComplete: true } },
        { $count: "count" }
      ])
    ]);

    const completedProfiles = completedProfilesAgg[0]?.count || 0;
    const recentRegistrations = recentUsers.map((user) => ({
      id: user._id,
      user: user.name,
      date: user.createdAt,
      role: user.role,
      status: user.education && user.skills?.length > 0 ? "Active" : "Pending"
    }));

    return res.status(200).json({
      totalUsers,
      completedProfiles,
      totalStudents,
      totalAdmins,
      totalCareers,
      recentUsers: recentRegistrations
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllUsers,
  getAnalytics
};
