const User = require("../models/User");
const passport = require("passport");
const RequestService = require("../services/RequestService");
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();

// Display registration form
exports.Register = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
        errorMsg: "",
        user: {},
        reqInfo: reqInfo,
    });
};

// POST register
exports.RegisterUser = async function (req, res) {
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    if (password === passwordConfirm) {
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
        });
        User.register(
            new User(newUser),
            req.body.password,
            function (err) {
                if (err) {
                    let reqInfo = RequestService.reqHelper(req);
                    return res.render("user/register", {
                        user: newUser,
                        errorMsg: err.message,
                        reqInfo: reqInfo,
                    });
                }
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secure/secure-area");
                });
            }
        );
    }
    else {
        let reqInfo = RequestService.reqHelper(req);
        res.render("user/register", {
            user: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                username: req.body.username,
            },
            errorMsg: "Passwords do not match",
            reqInfo: reqInfo,
        });
    }
};

exports.Login = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let errorMsg = req.query.errorMsg;
    res.render("user/login", {
        user: {},
        errorMsg: errorMsg,
        reqInfo: reqInfo,
    });
};

exports.LoginUser = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/user/profile",
        failureRedirect: "/user/login?errorMsg=Invalid login.",
    })(req, res, next);
};

exports.Logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log("Logout error");
            return next(err);
        }
        else {
            let reqInfo = RequestService.reqHelper(req);
            res.render("user/login", {
                user: {},
                // isLoggedIn: false,
                errorMsg: "",
                reqInfo: reqInfo,
            });
        }
    });
};

exports.Profile = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    if(reqInfo.authenticated) {
        let roles = await _userOps.getRolesByUsername(reqInfo.username);
        let sessionData = req.session;
        sessionData.roles = roles;
        reqInfo.roles = roles;
        let userInfo = await _userOps.getUserByUsername(reqInfo.username);
        return res.render("user/profile", {
            reqInfo: reqInfo,
            userInfo: userInfo,
        });
    }
    else {
        res.redirect(
            "/user/login?errorMsg=You must be logged in to view this page"
        );
    }
};

// Admin Area available to users who belong to Admin role
exports.AdminArea = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req, ["Admin"]);
    if (reqInfo.rolePermitted) {
      res.render("user/admin-area", { errorMsg: "", reqInfo: reqInfo });
    } else {
      res.redirect(
        "/user/login?errorMsg=You must be an admin to access this area."
      );
    }
  };

exports.ManagerArea = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);
    if (reqInfo.rolePermitted) {
        res.render("user/manager-area", {
            errorMsg: "",
            reqInfo: reqInfo,
        });
    }
    else {
        res.redirect(
            "/user/login?errorMsg=You must be an admin to access this area."
          );
    }
}