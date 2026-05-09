import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";

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

  //  Always continue if not redirected
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

export const userContext = async (req, res, next) => {
  try {
    const userId = req.session.user;
    let user = null;
    let cartCount = 0;

    if (userId) {
      user = await User.findById(userId);
      const cart = await Cart.findOne({ userId });
      if (cart && cart.items) {
        cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      }
    }

    res.locals.user = user;
    res.locals.cartCount = cartCount;
    next();
  } catch (error) {
    console.error("User Context Middleware Error:", error);
    next();
  }
};

