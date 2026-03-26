import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passport from "passport";
import './config/passport.js';
import session from "express-session";
import User from "./models/userModel.js";
import Cart from "./models/cartModel.js";
import * as ErrorHandler from "./middleware/errorHandler.js";

const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "-1");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
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
    res.locals.loginMethod = req.session.loginMethod || null;
    res.locals.path = req.path;
    next();
  } catch (error) {
    console.error("Middleware Error", error);
    next();
  }
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// Error Handling Middleware
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.globalErrorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
