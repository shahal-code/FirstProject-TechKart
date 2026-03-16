export const isAdminLoggedIn = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect("/admin/login");
    }
};

export const isAdminLoggedOut = (req, res, next) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
};
