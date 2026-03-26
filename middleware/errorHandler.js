/**
 * Error handling middleware.
 */

// Middleware to handle 404 Not Found errors
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global error handler middleware
export const globalErrorHandler = (err, req, res, next) => {
    // Always render the 404 page instead of a 500 error
    res.status(404);

    console.error("Error Caught:", err.message);

    return res.render("error/404", {
        title: "404 - Not Found",
        message: process.env.NODE_ENV === 'production' ? "Page Not Found" : err.message
    });
};
