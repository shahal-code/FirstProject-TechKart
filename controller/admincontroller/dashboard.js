import * as DashboardService from "../../services/admin/dashboardService.js";
import { GENERIC_MESSAGES } from "../../constants/messages.js";

export const loadDashboard = async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.render("admin/dashboard/dashboard", stats);
  } catch (error) {
    console.error("Error loading dashboard:", error.message);
    res.status(500).send(GENERIC_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

export const getChartData = async (req, res) => {
  try {
    const filter = req.query.filter || 'monthly';
    const chartData = await DashboardService.getChartData(filter);
    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error.message);
    res.status(500).json({ error: GENERIC_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

