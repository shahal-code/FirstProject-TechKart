import Order from "../../models/ordersModel.js";

/**
 * Build start/end Date objects based on filter string
 */
function buildDateRange(filter, start, end) {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
        case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            endDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case "weekly":
            const day  = now.getDay(); // 0 = Sun
            startDate  = new Date(now);
            startDate.setDate(now.getDate() - day);
            startDate.setHours(0, 0, 0, 0);
            endDate    = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case "monthly":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
        case "yearly":
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            endDate   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
        case "custom":
            startDate = start ? new Date(start + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
            endDate   = end   ? new Date(end   + "T23:59:59") : new Date();
            break;
        default:
            // Default to today
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            endDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    return { startDate, endDate };
}

/**
 * Build chart labels and group key based on filter
 */
function buildChartConfig(filter, startDate, endDate) {
    const labels   = [];
    const groupFmt = {};

    if (filter === "today") {
        // Hourly 0-23
        for (let h = 0; h < 24; h++) {
            labels.push(`${h}:00`);
        }
        return { labels, groupBy: "hour" };
    }

    if (filter === "weekly") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return { labels: days, groupBy: "dayOfWeek" };
    }

    if (filter === "monthly") {
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) labels.push(`${d}`);
        return { labels, groupBy: "dayOfMonth" };
    }

    if (filter === "yearly") {
        return { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], groupBy: "month" };
    }

    // Custom — day-by-day
    const cur = new Date(startDate);
    while (cur <= endDate) {
        labels.push(`${cur.getDate()}/${cur.getMonth() + 1}`);
        cur.setDate(cur.getDate() + 1);
    }
    return { labels, groupBy: "date" };
}

/**
 * Main Report Service
 */
export const getReportData = async (filter = "today", start = null, end = null) => {
    const { startDate, endDate } = buildDateRange(filter, start, end);

    // Fetch all non-cancelled orders in range, populate user
    const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ["Cancelled", "Returned"] }
    })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

    // Summary totals
    const totalOrders   = orders.length;
    const totalRevenue  = orders.reduce((s, o) => s + (o.totalPrice  || 0), 0);
    const totalDiscount = orders.reduce((s, o) => s + (o.discount    || 0), 0);
    const netRevenue    = orders.reduce((s, o) => s + (o.finalAmount || 0), 0);

    // Normalize orders to match EJS template field names
    const normalizedOrders = orders.map(o => ({
        _id:         o._id,
        orderId:     o.orderId,
        createdAt:   o.createdAt,
        userId:      o.userId,
        status:      o.status,
        totalAmount: o.totalPrice  || 0,
        discount:    o.discount    || 0,
        finalAmount: o.finalAmount || 0,
        couponCode:  o.couponCode  || null,
        paymentMethod: o.paymentMethod
    }));

    // Chart data
    const { labels, groupBy } = buildChartConfig(filter, startDate, endDate);
    const revenueMap  = {};
    const discountMap = {};
    labels.forEach(l => { revenueMap[l] = 0; discountMap[l] = 0; });

    orders.forEach(order => {
        const d = new Date(order.createdAt);
        let key;

        if (groupBy === "hour")       key = `${d.getHours()}:00`;
        else if (groupBy === "dayOfWeek") key = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
        else if (groupBy === "dayOfMonth") key = `${d.getDate()}`;
        else if (groupBy === "month") key = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
        else key = `${d.getDate()}/${d.getMonth() + 1}`;

        if (revenueMap[key]  !== undefined) revenueMap[key]  += order.finalAmount || 0;
        if (discountMap[key] !== undefined) discountMap[key] += order.discount    || 0;
    });

    const chartRevenue  = labels.map(l => revenueMap[l]  || 0);
    const chartDiscount = labels.map(l => discountMap[l] || 0);

    return {
        orders: normalizedOrders,
        totalOrders,
        totalRevenue:  Math.round(totalRevenue),
        totalDiscount: Math.round(totalDiscount),
        netRevenue:    Math.round(netRevenue),
        chartLabels:   labels,
        chartRevenue,
        chartDiscount,
        filter,
        startDate: start,
        endDate:   end
    };
};
