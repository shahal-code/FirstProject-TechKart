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
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    // Calculate summary stats for the cards
    const totalCount = await Category.countDocuments();
    const newestCategory = await Category.findOne().sort({ created_at: -1 });

    res.render("admin/category/category", {
      categories,
      page,
      totalPages,
      totalCategories,
      search,
      stats: {
        total: totalCount,
        addedQuarter: 0, // You can add logic for this later
        newestName: newestCategory ? newestCategory.name : "N/A",
        newestDate: newestCategory ? newestCategory.created_at : null,
      }
    });

  } catch (error) {
    console.error("Error loading category page:", error);
    res.redirect("/admin/pageerror");
  }
};
// Get Add Category Page
export const getAddCategoryPage = async (req, res) => {
  try {
    res.render("admin/category/add-category", {
      activePage: "category"
    });
  } catch (error) {
    console.error("Error loading add category page:", error);
    res.redirect("/admin/pageerror");
  }
};

// Add New Category
export const addCategory = async (req, res) => {

  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // Create new category
    const newCategory = new Category({
      name,
      description,
      url_slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      is_blocked: false
    });

    await newCategory.save();
    res.status(201).json({ message: "Category added successfully" });

  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Toggle Category Status (Block/Unblock)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.is_blocked = !category.is_blocked;
    await category.save();

    res.status(200).json({ 
      message: `Category ${category.is_blocked ? 'blocked' : 'unblocked'} successfully`,
      is_blocked: category.is_blocked
    });

  } catch (error) {
    console.error("Error toggling category status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Get Edit Category Page
export const getEditCategoryPage = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.redirect("/admin/category");
    }

    res.render("admin/category/edit-category", {
      category,
      activePage: "category"
    });
  } catch (error) {
    console.error("Error loading edit category page:", error);
    res.redirect("/admin/pageerror");
  }
};

// Edit Category
export const editCategory = async (req, res) => {

  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category name already exists" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { 
        name, 
        description,
        url_slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });

  } catch (error) {
    console.error("Error editing category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
