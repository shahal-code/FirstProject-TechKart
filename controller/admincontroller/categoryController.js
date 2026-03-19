import Category from "../../models/categoryModel.js";

// Load Category Page
export const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const search = req.query.search || "";

    // Build search query
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Fetch categories with pagination and descending sort
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    // Calculate summary stats for the cards
    const totalCount = await Category.countDocuments();
    const newestCategory = await Category.findOne().sort({ createdAt: -1 });

    res.render("admin/category", {
      categories,
      page,
      totalPages,
      totalCategories,
      search,
      stats: {
        total: totalCount,
        addedQuarter: 0, // You can add logic for this later
        newestName: newestCategory ? newestCategory.name : "N/A",
        newestDate: newestCategory ? newestCategory.createdAt : null,
      }
    });

  } catch (error) {
    console.error("Error loading category page:", error);
    res.redirect("/admin/pageerror");
  }
};
