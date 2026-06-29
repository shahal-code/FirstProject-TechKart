import * as ReportService from "../../services/admin/reportService.js";
import { REPORT_MESSAGES } from "../../constants/messages.js";
import { STATUS_CODES } from "../../constants/statusCode.js";


/**
 * Load Sales Reports Page
 */
export const loadReports = async (req, res) => {
    try {
        const filter = req.query.filter || "today";
        const start  = req.query.start  || null;
        const end    = req.query.end    || null;
        const page   = parseInt(req.query.page) || 1;

        const data = await ReportService.getReportData(filter, start, end, page);

        res.render("admin/reports/reports", {
            ...data,
            activePage: "reports"
        });
    } catch (error) {
        console.error("Load Reports Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(REPORT_MESSAGES.LOAD_FAILED);
    }
};

