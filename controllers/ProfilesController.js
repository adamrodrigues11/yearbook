"use strict";

const ProfileOps = require("../data/ProfileOps");
const _profileOps = new ProfileOps();

// all profiles
exports.Index = async function(req, res) {
    const {profiles, errorMsg} = await _profileOps.getAllProfiles();
    res.render("profiles", {
        title: "Profiles",
        profiles: profiles,
        errorMsg: errorMsg
    });
};

// single profile (details)
exports.Details = async function (req, res) {
    const {profile} = await _profileOps.getProfileById(req.params.id);
    if (profile) {
        renderProfile(profile, res);
    } else {
        res.status(404).send("File Not Found");
    }
};

// create - GET
exports.Create = async function (req, res) {
    res.render("profile-form", {
        title: "Create A New Profile",
        profile: null,
        errorMsg: ""
    });
};

// create - POST
exports.CreateProfile = async function (req, res) {
    const formData = {
        name: req.body.name 
    };

    const {obj, errorMsg} = await _profileOps.createProfile(formData);

    if (errorMsg === "") {
        renderProfile(obj, res);
    } else {
        res.render("profile-form", {
            title: "Create Profile",
            profile: obj,
            errorMsg: errorMsg
        });
    }
};

// edit - GET
exports.Edit = async function (req, res) {
    const {profile} = await _profileOps.getProfileById(req.params.id);
    if (profile) {
        res.render("profile-form", {
            title: "Edit Profile",
            profile: profile,
            errorMsg: ""
        });
    } else {
        res.status(404).send("File Not Found"); // change to call to CreateProfile()? maybe?
    }
};

// edit - POST
exports.EditProfile = async function (req, res) {
    const formData = {
        id: req.params.id,
        name: req.body.name
    };
    
    const {obj, errorMsg} = await _profileOps.updateProfile(formData);

    if (errorMsg === "") {
        renderProfile(obj, res); 
    } else {
        res.render("profile-form", {
            title: "Edit Profile",
            profile: obj,
            errorMsg: errorMsg
        });
    }
};

// delete
exports.DeleteProfileById = async function (req, res) {
    const profileId = req.params.id;

    const deleteErrorMsg = await _profileOps.DeleteProfileById(profileId);
    const {profiles, errorMsg} = await _profileOps.getAllProfiles();

    res.render("profiles", {
        title: "Profiles",
        profiles: profiles,
        errorMsg: deleteErrorMsg + errorMsg
    });
};


async function renderProfile(profile, res) {
    const {profiles, errorMsg} = await _profileOps.getAllProfiles();
    const otherProfiles = profiles.filter(
        p => p.id !== profile.id);
    res.render("profile", {
        title: profile.name,
        profile: profile,
        otherProfiles: otherProfiles,
        layout: "./layouts/side-bar",
        errorMsg: errorMsg
    });    
}