"use strict";

// Dependencies
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileupload = require("express-fileupload");
const mongoose = require("mongoose");

// how to roll the connection timeout?
// MongoDB connection
const uri =
    "mongodb+srv://user-02:qCRv7kEhqCbbaOxp@ssd.bfarfsk.mongodb.net/Yearbook"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.once("open", function () {
    console.log("Connected to Mongo");
});
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create App Server & Port
const app = express();
const port = process.envPORT || 3000;

//Use Logger
app.use(logger("dev"));

// parse form data and JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileupload()); // manage file uploads in forms

// session management
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
    uri: uri,
    collection: "sessions",
});
store.on("error", function (error) {
    console.log(error);
});
const sessionOptions = {
    secret: "session secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 20 }, // 20 minutes
    rolling: true, // refresh with new request
    store: store,
};
app.use(session(sessionOptions));
app.use(cookieParser());

// initialize passport and configure for User model
app.use(passport.initialize());
app.use(passport.session());
const User = require("./models/User");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ejs templating
app.set("view engine", "ejs");

//layouts
app.use(expressLayouts);
app.set("layout", "./layouts/main-layout.ejs"); // set default layout

// make views folder globally accessible 
app.set("views", path.join(__dirname, "views"));

// make public folder accessible for serving static files
app.use(express.static("public"));

// Homepage Routes
const indexRouter = require("./routers/indexRouter");
app.use("/", indexRouter);

// User Routes
const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);

//Set Error Message for Invalid URL
app.all("/*", (req, res) => {
    res.status(404).send("File Not Found");
});

//Activate Server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));