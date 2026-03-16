import User from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user);
      if (user && !user.isBlocked) {
        next();
      } else {
        req.session.destroy((err) => {
          if (err) console.log("Session destruction error:", err);
          res.redirect("/user/login?message=Your account has been blocked by the administrator");
        });
      }
    } catch (error) {
      console.log("Middleware Error:", error);
      res.redirect("/user/login");
    }
  } else {
    res.redirect("/user/login");
  }
};

export const isLoggin = async (req, res, next) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user);
      if (user && !user.isBlocked) {
        return res.redirect("/user/dashboard");
      } else if (user && user.isBlocked) {
        return req.session.destroy((err) => {
          if (err) console.log("Session destruction error:", err);
          next();
        });
      }
    } catch (error) {
      console.log("Middleware Error:", error);
    }
  }
  next();
};

export const isBlocked = async (req, res, next) => {
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user);
            if (user && user.isBlocked) {
                return req.session.destroy((err) => {
                    res.redirect("/user/login?message=Your account has been blocked");
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
    next();
};

// Removed admin methods here

export const noCache = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
};
