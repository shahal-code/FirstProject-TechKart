export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check if it's an API route or a page render route
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
    }

    // Render a 500 error page for normal requests
    res.status(500).render('user/404', { message: 'Something went wrong! Internal Server Error.' }); 
};

export const notFoundHandler = (req, res, next) => {
    res.status(404).render('user/404', { message: 'Page not found' });
};
