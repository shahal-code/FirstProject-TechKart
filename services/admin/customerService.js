import User from "../../models/userModel.js";

/**
 * Get all users with pagination and search.
 */
export const getAllUsers = async (query, page, limit) => {
  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalUsers,
    totalPages
  };
};

/**
 * Toggle user block status.
 */
export const toggleBlockStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  return await user.save();
};
