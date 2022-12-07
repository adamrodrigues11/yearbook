"use strict";
// const fs = require("fs").promises;
// const path = require("path");
const express = require("express");
const profilesRouter = express.Router();
const profilesController = require("../controllers/ProfilesController");

// const profilesPath = path.join(__dirname + "/../data/profiles.json");

// all profiles
profilesRouter.get("/", profilesController.Index);

// create - GET
profilesRouter.get("/profile-form", profilesController.Create);

// create - POST
profilesRouter.post("/profile-form", profilesController.CreateProfile);

// edit - GET
profilesRouter.get("/profile-form/:id", profilesController.Edit);

// edit - POST
profilesRouter.post("/profile-form/:id", profilesController.EditProfile);

// single profile (details)
profilesRouter.get("/:id", profilesController.Details);

// delete
profilesRouter.get("/:id/delete", profilesController.DeleteProfileById);

module.exports = profilesRouter;