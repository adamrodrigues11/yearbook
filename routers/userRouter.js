"use strict";
const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/UserController");

userRouter.get("/", userController.ViewAllProfiles);

userRouter.get("/login", userController.Login);

userRouter.post("/login", userController.LoginUser);

userRouter.get("/logout", userController.Logout);

userRouter.get("/register", userController.Register);

userRouter.post("/register", userController.RegisterUser);

userRouter.get("/:username/edit", userController.Edit);

userRouter.post("/:username/edit", userController.EditProfile);

userRouter.get("/:username/delete", userController.DeleteUserByUsername);

userRouter.get("/:username", userController.ProfileDetails);

userRouter.post("/:username", userController.PostCommentToProfile);

module.exports = userRouter;