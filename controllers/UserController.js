"use strict";
const passport = require("passport");
const User = require("../models/User");
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();
const RequestService = require("../services/RequestService");
const path = require("path");
const publicImagesDirPath = path.join(__dirname, "../public/images/");

// display registration page
exports.Register = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    res.render("user/register", {
        title: "Register",
        user: {},
        errorMsg: "",
        reqInfo: reqInfo,
    });
};

// parse registration form and attempt to register a new user in the db
exports.RegisterUser = async function (req, res) {
    // parse form data
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const interests = req.body.interests.split(",").map(interest => interest.trim());
    const profilePic = req.files?.profilePic ?? null;

    // guard if passwords do not match, return to register form with other saved data
    if (password !== passwordConfirm) {
        return res.render("user/register", {
            title: "Register",
            user: {
                username: req.body.username,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                interests: interests,
            },
            errorMsg: "Passwords do not match",
            reqInfo: { authenticated: false },
        });
    }

    // if a profile pic is uploaded, save it to public/images directory and create a relative path, 
    let profilePicPath;
    if (profilePic) {
        const profilePicAbsPath = publicImagesDirPath + profilePic.name;
        profilePic.mv(profilePicAbsPath);
        profilePicPath = `/images/${profilePic.name}`;
    }

    // create new user object and attempt to save to db
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        interests: interests,
        profilePicPath: profilePicPath,
        roles: ["user"], // default role is user
    });
    User.register(
        newUser,
        req.body.password,
        function (err) {
            // if error, return to register form with saved data and errorMsg
            if (err) {
                return res.render("user/register", {
                    title: "Register",
                    user: newUser,
                    errorMsg: err.message,
                    reqInfo: { authenticated: false },
                });
            }
            else {
                // if no error, redirect to their profile page
                passport.authenticate("local")(req, res, function () {
                    res.redirect(newUser.username);
                    return;
                });
            }
        }
    );
};

// display login page
exports.Login = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    const errorMsg = req.query.errorMsg;

    res.render("user/login", {
        title: "Login",
        user: {},
        errorMsg: errorMsg,
        reqInfo: reqInfo,
    });
};

// login user
exports.LoginUser = function (req, res, next) {
    const username = req.body.username;

    passport.authenticate("local", {
        successRedirect: username,
        failureRedirect: "./login?errorMsg=Invalid login",
    })(req, res, next);
};

// logout user
exports.Logout = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    
    // guard if not logged in
    if (!reqInfo.authenticated) {
        res.redirect("./login");
        return;
    }
    // attempt logout
    req.logout((err) => {
        if (err) {
            console.log("Logout error");
            return next(err);
        }
        // upon successful logout, redirect to login page
        else {
            res.redirect("./login");
        }
    });
};

// list all user profiles sorted alphabetically by lastName
exports.ViewAllProfiles = async function(req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    let {searchField, searchString, errorMsg} = req.query;
    
    // guard if not logged in
    if(!reqInfo.authenticated) {
        res.redirect("./login?errorMsg=You must be logged in to view this page.");
        return;
    }

    let users;
    // apply search filters if applicable
    if(!errorMsg && searchString) {
        try {
            users = await _userOps.searchUsers(searchField, searchString);
        }
        catch(error) {
            errorMsg = error.message;
        }
    }
    // otherwise fetch all users
    else {
        users = await _userOps.getAllUsers();
    }
    return res.render("user/profiles", {
        title: "Profiles",
        users: users,
        reqInfo: reqInfo,
        errorMsg: errorMsg,
    });

};

// view single user profile
exports.ProfileDetails = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    const username = req.params.username;
    const errorMsg = req.query.errorMsg;
    
    // guard if not logged in
    if(!reqInfo.authenticated) {
        res.redirect("./login?errorMsg=You must be logged in to view this page.");
        return;
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
};

// save comments to user profile
exports.PostCommentToProfile = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    const username = req.params.username;
    const comment = {
        commentBody: req.body.commentBody,
        commentAuthor: reqInfo.username,
    };
    try {
        await _userOps.addCommentToUser(comment, username);
        res.redirect(`./${username}`);
    }
    catch(error) {
        res.redirect(`./${username}?errorMsg=${error.message}`);
    }
}

// Note on permissions: 
// Since admin permissions contain manager permissions which contain basic user permissions,
// an admin will have roles = ["user", "manager", "admin"]
// likewise, a manager will have roles = ["user", "manager"] 

// display edit user page
exports.Edit = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    const username = req.params.username; // username of profile to edit
    const errorMsg = req.query.errorMsg;

    // guard if not logged in
    if (!reqInfo.authenticated) {
        res.redirect("../login?errorMsg=You must be logged in to view this page.");
        return;
    }

    // guard if logged in user's roles do not include manager
    // AND they are attempting to edit the profile of another user
    if(!reqInfo.roles.includes("manager") && username !== reqInfo.username) {
        res.redirect(`../${username}?errorMsg=You do not have permission to edit this user's profile`);
        return;
    }

    let user = await _userOps.getUserByUsername(username);
    return res.render("user/edit", {
        title: `Edit Profile - ${user.username}`,
        user: user,
        reqInfo: reqInfo,
        errorMsg: errorMsg,
    });
};

// attempt to edit user in db
exports.EditProfile = async function (req, res) {
    const reqInfo = await RequestService.reqHelper(req);
    const username = req.params.username;
    
    // guard for invalid editing permissions 
    // (if logged is not manager (or admin) and is attempting to edit the profile of another user) 
    if(!reqInfo.roles.includes("manager") && username !== reqInfo.username) {
        res.redirect(`../${username}?errorMsg=You do not have permission to edit this user's profile`);
        return;
    }

    // get text data from edit form
    const newUserData = req.body;

    // update roles if applicable and logged in user is manager (or admin)
    // these edits can only be made by managers (or admin)
    if(newUserData.role && reqInfo.roles?.includes("manager")) {
        await _userOps.editRolesByUsername(username, newUserData);
    }

    // if logged in user is not admin or editing their own profile, exit here
    if(!reqInfo.roles.includes("admin") || username !== reqInfo.username) {
        res.redirect(`../${username}`);
        return;
    }

    // the following edits can only be made by admin or by any user to their own profile

    // if a new profile pic is uploaded, save it to public/images directory and create a relative path 
    const newProfilePic = req.files?.profilePic ?? null;
    let newProfilePicPath;
    if(newProfilePic) {
        const newProfilePicAbsPath = publicImagesDirPath + newProfilePic.name;
        newProfilePic.mv(newProfilePicAbsPath);
        newProfilePicPath = `/images/${newProfilePic.name}`;
    }

    // attempt to save changes to the db
    try {
        await _userOps.editUserByUsername(username, newUserData, newProfilePicPath, reqInfo);
        res.redirect(`../${username}`);
        return;
    } 
    catch(error) {
        res.redirect(`./edit?errorMsg=${error.message}`);
    }
};

// attempt to delete user
exports.DeleteUserByUsername = async function (req, res) {
    let reqInfo = await RequestService.reqHelper(req);
    let username = req.params.username; // username of user to delete
    
    // guard if not logged in
    if(!reqInfo.authenticated) {
        res.redirect("../login?errorMsg=You must be logged in to view this page.");
        return;
    }
    
    // guard if logged in user is not admin
    if(!reqInfo.roles?.includes("admin")) {
        res.redirect(`../${username}?errorMsg=You do not have permission to delete users`);
        return;
    }

    try {
        _userOps.deleteUserByUsername(username);
        res.redirect("../"); // redirect to all profiles
        return;
    } 
    catch(error) {
        res.redirect(`../${username}?errorMsg=${error.messsage}`);
    }
    
};


