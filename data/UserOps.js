"use strict";
const User = require("../models/User");
const FileCleaner = require("../services/FileCleaner");

class UserOps {
    UserOps() {}

    async getAllUsers() {
        let users = await User.find({}).sort({lastName: 1}); // sort by LastName ascending
        if(users) {
            return users;
        }
        else {
            return [];
        }
    }

    async getUserByUsername(username) {
        let user = await User.findOne({username: username}, {_id: 0});
        if(user) {
            return user;
        }
        else {
            return null;
        }
    }

    async getRolesByUsername(username) {
        let user = await User.findOne({ username: username }, { _id: 0, roles: 1 });
        if (user.roles) {
            return user.roles;
        }
        else {
            return [];
        }
    }

    async editUserByUsername(username, newUserData, newProfilePicPath, reqInfo) 
    {  
        const interests = newUserData.interests?.split(",").map(interest => interest.trim()) ?? [];
        let user = await User.findOne({username: username});
        // const oldProfilePicPath = user.profilePicPath;
        user.email = newUserData.email;
        user.firstName = newUserData.firstName;
        user.lastName = newUserData.lastName;
        user.interests = interests;
        user.profilePicPath = newProfilePicPath ?? user.profilePicPath, 
        
        user.save(function (err) {
                if (err) {
                    console.log(err.message);
                    throw err;
                }
                else {
                    console.log("Updated user info for ", username);
                    // FileCleaner.deleteOldProfilePic(oldProfilePicPath);
                }
            }
        );
    }

    async editRolesByUsername(username, newUserData) {
        let roles;
        switch(newUserData.role) {
            case "manager":
                roles = ["user", "manager"];
                break;
            case "admin":
                roles = ["user", "manager", "admin"];
                break;
            default:
                roles = ["user"];
                break;
        }
        User.updateOne({username: username}, {roles: roles}, function (err) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            else {
                console.log("Updated roles for user ", username);
            }
        });
    }

    async deleteUserByUsername(username) {
        let user = User.findOne({username: username});
        // const oldProfilePicPath = user.profilePicPath; 
        User.deleteOne({username: username}, function (err, docs) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            else {
                console.log("Deleted User: ", docs);
                // FileCleaner.deleteOldProfilePic(oldProfilePicPath);
            }
        });
    }

    async addCommentToUser(comment, username) {
        let user = await User.findOne({ username: username });
        user.comments.push(comment);
        user.save(function(err, doc) {
            if(err) {
                console.log("error adding comment to user: ", username);
                throw err;
            }
            else {
                console.log("added comment to user: ", doc);
            }
        });
    }

    async searchUsers(searchField, searchString) {
        let filter;
        let filterValue = { $regex: searchString, $options: 'i'};
        switch(searchField) {
            case "firstName":
                filter = {firstName: filterValue};
                break;
            case "lastName":
                filter = {lastName: filterValue};
                break;
            case "email":
                filter = {email: filterValue};
                break;
            case "interests":
                filter = {interests: filterValue};
                break;
            default:
                const err = new Error("Error in search field - please choose a valid option"); 
                console.log(err.message);
                throw err;
        }
        let users = await User.find(filter).sort({username: 1});
        return users;
    }   
}

module.exports = UserOps;


