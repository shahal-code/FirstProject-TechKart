import * as DashboardService from "../../services/admin/dashboardService.js";

export const loadDashboard = async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.render("admin/dashboard", stats);
  } catch (error) {
    console.error("Error loading dashboard:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
