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
userRouter.get("/register", userController.Register);

// register user - POST
userRouter.post("/register", userController.RegisterUser);

// edit - GET
userRouter.get("/:username/edit", userController.Edit);

// edit profile - POST
userRouter.post("/:username/edit", userController.EditProfile);

// delete user
userRouter.get("/:username/delete", userController.DeleteUserByUsername);

// view single user profile
userRouter.get("/:username", userController.ProfileDetails);

module.exports = userRouter;