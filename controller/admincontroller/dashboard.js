export const loadDashboard = async (req, res) => {
  try {
    res.render("admin/dashboard", {
      activePage: "dashboard",
      pageTitle: "Global Overview",
      pageSubtitle: "Real-time Admin Statistics"
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
