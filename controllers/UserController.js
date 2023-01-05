// check redirects on lack of permissions for edit and delete methods
// save login to session data and update in req helper

"use strict";
const User = require("../models/User");
const passport = require("passport");
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();
const RequestService = require("../services/RequestService");

// Register / create user - GET
exports.Register = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
        title: "Register",
        user: {},
        errorMsg: "",
        reqInfo: reqInfo,
    });
};

// Register / create user - POST
exports.RegisterUser = async function (req, res) {
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const interests = req.body.interests.split(",").map(interest => interest.trim());
    if (password === passwordConfirm) {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            interests: interests,
            profilePhotPath: req.body.profilePhotoPath,
            roles: ["user"],
        });
        User.register(
            new User(newUser),
            req.body.password,
            function (err) {
                // if error, return to register form with saved data and errorMsg
                if (err) {
                    let reqInfo = RequestService.reqHelper(req);
                    return res.render("user/register", {
                        title: "Register",
                        user: newUser,
                        errorMsg: err.message,
                        reqInfo: reqInfo,
                    });
                }
                // if no error, redirect to their profile page
                passport.authenticate("local")(req, res, function () {
                    // move to profile details page since both login and register are redirected there
                    // const sessionData = req.session;
                    // sessionData.username = newUser.username;
                    res.redirect(newUser.username);
                });
            }
        );
    }
    else {
        // if passwords do not match, return to register form with other saved data
        let reqInfo = RequestService.reqHelper(req);
        res.render("user/register", {
            title: "Register",
            user: {
                username: req.body.username,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                interests: interests,
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
        title: "Login",
        user: {},
        errorMsg: errorMsg,
        reqInfo: reqInfo,
    });
};

exports.LoginUser = function (req, res, next) {
    const username = req.body.username;
    passport.authenticate("local", {
        successRedirect: username,
        failureRedirect: "login?errorMsg=Invalid login",
    })(req, res, next);
};

exports.Logout = async function (req, res) {
    req.logout((err) => {
        if (err) {
            console.log("Logout error");
            return next(err);
        }
        else {
            let reqInfo = RequestService.reqHelper(req);
            res.render("user/login", {
                title: "Login",
                user: {},
                errorMsg: "",
                reqInfo: reqInfo,
            });
        }
    });
};

// view all user profiles
exports.ViewAllProfiles = async function(req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let errorMsg = req.query.errorMsg;
    if(reqInfo.authenticated) {
        const users = await _userOps.getAllUsers();
        return res.render("user/profiles", {
            title: "Profiles",
            users: users,
            reqInfo: reqInfo,
            errorMsg: errorMsg,
        });
    }
    else {
        res.redirect("user/login?errorMsg=You must be logged in to view this page.");
    }
};

// view single user profile
exports.ProfileDetails = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let username = req.params.username;
    let errorMsg = req.query.errorMsg;
    if(reqInfo.authenticated) {
        // check if there are roles from the session, if not, search from database
        if(reqInfo.roles.length === 0) {
            let roles = await _userOps.getRolesByUsername(username);
            req.session.roles = roles;
            reqInfo.roles = roles;    
        }
        const user = await _userOps.getUserByUsername(username);
        const allUsers = await _userOps.getAllUsers();
        const otherUsers = allUsers.filter(u => u.username !== user.username);
        return res.render("user/profile", {
            title: `Profile - ${user.username}`,
            user: user,
            otherUsers: otherUsers,
            reqInfo: reqInfo,
            errorMsg: errorMsg,
            layout: "./layouts/side-bar.ejs",
        });
    }
    else {
        res.redirect("login?errorMsg=You must be logged in to view this page.");
    }
};

// edit user profile - GET
// only admin, manager, or self
exports.Edit = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    if(reqInfo.authenticated) {
        let username = req.params.username;
        // if active user is a manager or selected profile has the same username as active user
        if(reqInfo.roles?.includes("manager") || username === reqInfo.username) {
            let user = await _userOps.getUserByUsername(username);
            return res.render("user/edit", {
                title: `Edit Profile - ${user.username}`,
                user: user,
                reqInfo: reqInfo,
                // errorMsg: errorMsg,
            });
        }
        else {
            res.redirect(`./?errorMsg=You do not have permission to edit this user's profile`);
        }
    }
    else {
        res.redirect("../login?errorMsg=You must be logged in to view this page.");
    }
};

// edit user profile - POST
// only manager or admin can edit roles
// only admin or self edit other fields
exports.EditProfile = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let username = req.params.username;
    let newUserData = req.body;
    let errorMsg;
    try {
        _userOps.editUserByUsername(username, newUserData, reqInfo);
        res.redirect(`../${username}`)
        return
    } 
    catch(error) {
        errorMsg = error.message;
    }
    res.redirect(`./edit?errorMsg=${errorMsg}`);
};

// delete user
// only admin
exports.DeleteUserByUsername = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    if(!reqInfo.authenticated) {
        res.redirect("../login?errorMsg=You must be logged in to view this page.");
        return
    }
    let username = req.params.username;
    let errorMsg = "You do not have permission to delete users"; // default errorMsg
    // ensure the req comes from an admin
    if(reqInfo.roles?.includes("admin")) {
        try {
            _userOps.deleteUserByUsername(username);
            res.redirect("../"); // redirect to all profiles
            return
        } 
        catch(error) {
            errorMsg = error.message;
        }
    }
    // if not admin or an error occurs, redirect to user profile page with errorMsg
    res.redirect(`./?errorMsg=${errorMsg}`);
};


// saving comments to user profile
// console.log("Saving a comment for ", req.params.username);
// const comment = {
//   commentBody: req.body.comment,
//   commentAuthor: reqInfo.username,
// };
// let profileInfo = await _userOps.addCommentToUser(
//   comment,
//   req.params.username
// );