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
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Handle other errors (500)
    console.error("Error Handler Caught:", err.message);
    try {
        res.render("error/500", {
            title: "500 - Internal Server Error",
            message: process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    } catch (renderError) {
        // Fallback if 500 view is missing
        res.status(500).send("<h1>500 - Internal Server Error</h1><p>" + 
            (process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message) + 
            "</p>");
    }
};
