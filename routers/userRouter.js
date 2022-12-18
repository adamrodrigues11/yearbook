"use strict";
const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/UserController");

// view all user profiles
userRouter.get("/", userController.ViewAllProfiles);

// login user - GET
userRouter.get("/login", userController.Login);

// login user - POST
userRouter.post("/login", userController.LoginUser);

// logout
userRouter.get("/logout", userController.Logout);

// register - GET
userRouter.get("/profile-form", userController.Register);

// register user - POST
userRouter.post("/profile-form", userController.RegisterUser);

// edit - GET
userRouter.get("/profile-form/:username", userController.Edit);

// edit profile - POST
userRouter.post("/profile-form/:username", userController.EditProfile);

// view single user profile
userRouter.get("/:username", userController.ProfileDetails);

// delete user
userRouter.get("/:username/delete", userController.DeleteUserByUsername);

module.exports = userRouter;