import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passport from "passport";
import './config/passport.js';
import { noCache } from "./middleware/userAuth.js";
import session from "express-session";
import User from "./models/userModel.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandling.js";

const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave:false,
    saveUninitialized:false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(noCache);

app.use(async (req, res, next) => {
  try {
    res.locals.user = req.session.user ? await User.findById(req.session.user) : null;
    res.locals.path = req.path;
    next();
  } catch (error) {
    console.log("MiddleWare Error", error);
    next();
  }
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
