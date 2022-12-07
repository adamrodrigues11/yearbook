// Dependencies
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cookieParser = require("cookie-parser");

// Db Setup
const mongoose = require("mongoose");
const expressEjsLayouts = require("express-ejs-layouts");
const uri = "mongodb+srv://user-02:qCRv7kEhqCbbaOxp@ssd.bfarfsk.mongodb.net/NodeDay05?retryWrites=true&w=majority";

// Set up mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.once("open", function () {
    console.log("Connected to Mongo");
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Set up server
const app = express();

// parse form data and JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

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
app.use(
    require("express-session")({
        secret: "session secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 },
        store: store,
    })
);
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
app.use(expressEjsLayouts);
app.set("layout", "./layouts/main-layout.ejs");
// make views folder globally accessible 
app.set("views", path.join(__dirname, "views"));
// make public folder accessible for serving static files
app.use(express.static("public"));

// Index routes
const indexRouter = require("./routers/indexRouter");
app.use(indexRouter);

// User routes
const userRouter = require("./routers/userRouter");
app.use("/user", userRouter);

// secure routes
const secureRouter = require("./routers/secureRouter");
app.use("/secure", secureRouter);

// start listening
const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`Auth Demo listening on port ${port}`));
