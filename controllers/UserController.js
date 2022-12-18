"use strict";
const User = require("../models/User");
const passport = require("passport");
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();
const RequestService = require("../services/RequestService");

// Register / create user - GET
exports.Register = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/profile-form", {
        title: "Register",
        user: {},
        errorMsg: "",
        reqInfo: reqInfo,
    });
    console.log("Register");
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
            profilePhotPath: req.body.profilePhotPath,
        });
        User.register(
            new User(newUser),
            req.body.password,
            function (err) {
                // if error, return to register form with saved data and errorMsg
                if (err) {
                    let reqInfo = RequestService.reqHelper(req);
                    return res.render("user/profile-form", {
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
                    res.redirect(`/user/${newUser.username}`);
                });
            }
        );
    }
    else {
        // if passwords do not match, return to register form with other saved data
        let reqInfo = RequestService.reqHelper(req);
        res.render("user/profile-form", {
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
    passport.authenticate("local", {
        successRedirect: "profile",
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
    // const {profiles, errorMsg} = await _profileOps.getAllProfiles();
    // res.render("profiles", {
    //     title: "Profiles",
    //     profiles: profiles,
    //     errorMsg: errorMsg
    // });
    console.log("View All Profiles");
};

// view single user profile
exports.ProfileDetails = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    let errorMsg = req.query.errorMsg;
    if(reqInfo.authenticated) {
        let roles = await _userOps.getRolesByUsername(reqInfo.username);
        let sessionData = req.session;
        sessionData.roles = roles;
        reqInfo.roles = roles;
        let user = await _userOps.getUserByUsername(reqInfo.username);
        return res.render("user/profile", {
            title: `Profile - ${user.username}`,
            user: user,
            reqInfo: reqInfo,
            errorMsg: errorMsg,
        });
    }
    else {
        res.redirect("login?errorMsg=You must be logged in to view this page.");
    }
};

// edit user profile - GET
// only admin, manager, or self
exports.Edit = async function (req, res) {
    // const {profile} = await _profileOps.getProfileById(req.params.id);
    // if (profile) {
    //     res.render("profile-form", {
    //         title: "Edit Profile",
    //         profile: profile,
    //         errorMsg: ""
    //     });
    // } else {
    //     res.status(404).send("File Not Found"); // change to call to CreateProfile()? maybe?
    // }
    console.log("Edit");
};

// edit user profile - POST
// only manager or admin can edit roles
// only admin, manager, or self edit other fields
exports.EditProfile = async function (req, res) {
    // const formData = {
    //     id: req.params.id,
    //     name: req.body.name
    // };
    
    // const {obj, errorMsg} = await _profileOps.updateProfile(formData);

    // if (errorMsg === "") {
    //     renderProfile(obj, res); 
    // } else {
    //     res.render("profile-form", {
    //         title: "Edit Profile",
    //         profile: obj,
    //         errorMsg: errorMsg
    //     });
    // }
    console.log("Edit Profile");
};

// delete user
// only admin
exports.DeleteUserByUsername = async function (req, res) {
    // const profileId = req.params.id;

    // const deleteErrorMsg = await _profileOps.DeleteProfileById(profileId);
    // const {profiles, errorMsg} = await _profileOps.getAllProfiles();

    // res.render("profiles", {
    //     title: "Profiles",
    //     profiles: profiles,
    //     errorMsg: deleteErrorMsg + errorMsg
    // });
    console.log("delete");
};


// async function renderProfile(profile, res) {
//     const {profiles, errorMsg} = await _profileOps.getAllProfiles();
//     const otherProfiles = profiles.filter(
//         p => p.id !== profile.id);
//     res.render("profile", {
//         title: profile.name,
//         profile: profile,
//         otherProfiles: otherProfiles,
//         layout: "./layouts/side-bar",
//         errorMsg: errorMsg
//     });    
// }


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