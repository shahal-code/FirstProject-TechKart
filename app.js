import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passport from "passport";
import './config/passport.js';
import session from "express-session";
import * as ErrorHandler from "./middleware/errorHandler.js";
import { userContext } from "./middleware/userAuth.js";

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

app.use(userContext);
app.use((req, res, next) => {
  res.locals.loginMethod = req.session.loginMethod || null;
  res.locals.path = req.path;
  next();
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// Error Handling Middleware
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.globalErrorHandler);



app.listen(3000, () => {
  console.log(`Server running on http://localhost:${3000}`);
});
