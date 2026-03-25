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

    console.error("Error Caught:", err.message);

    if (statusCode === 404) {
        return res.render("error/404", {
            title: "404 - Not Found",
            message: err.message
        });
    }

    // Default simple 500 response (no view)
    res.status(500).send(`<h1>500 - Internal Server Error</h1><p>${process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message}</p>`);
};
