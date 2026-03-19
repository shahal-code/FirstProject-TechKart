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

export const isAlreadyLoggedIn = async (req, res, next) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user);

      if (user && !user.isBlocked) {
        return res.redirect("/user/dashboard");
      }

      if (user && user.isBlocked) {
        return req.session.destroy((err) => {
          if (err) console.log("Session destruction error:", err);
          return res.redirect("/user/login?message=Your account has been blocked");
        });
      }

    } catch (error) {
      console.log("Middleware Error:", error);
    }
  }

  // ✅ ALWAYS continue if not redirected
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

// no cache

export const noCache = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

