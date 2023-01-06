"use strict";
const fs = require('fs');
const User = require("../models/User");

class UserOps {
    UserOps() {}

    async getAllUsers() {
        let users = await User.find({}).sort({username: 1});
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

    async editUserByUsername(username, newUserData, formProfilePicPath, reqInfo) 
    {
        // const newPassword = newUserData.newPassword;
        // const newPasswordConfirm = newUserData.passwordConfirm;
        const interests = newUserData.interests.split(",").map(interest => interest.trim());
        const newProfilePicPath = formProfilePicPath;

        if ( newUserData.role && reqInfo.roles?.includes("manager")) {
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
            })
        }

        if(reqInfo.roles?.includes("manager") || username === reqInfo.username) {
            // if (newPassword === newPasswordConfirm) { 
            // }
            User.updateOne(
                {username: username}, 
                {
                    email: newUserData.email,
                    firstName: newUserData.firstName,
                    lastName: newUserData.lastName,
                    interests: interests,
                    profilePicPath: newProfilePicPath, 
                }, 
                function (err) {
                    if (err) {
                        console.log(err.message);
                        throw err;
                    }
                    else {
                        console.log("Updated user info for ", username);
                        // clean up - delete old profile pic from public assets
                        // fs.unlink(path, (err) => {
                        // if (err) {
                        //     console.error(err)
                        //     return
                        // }

                        // //file removed
                        // })
                    }
                }
            )
        }
    }

    async deleteUserByUsername(username) {
        User.findOneAndDelete({username: username}, function (err, docs) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            else {
                console.log("Deleted User: ", docs);
                 // clean up - delete old profile pic from public assets
                        // fs.unlink(path, (err) => {
                        // if (err) {
                        //     console.error(err)
                        //     return
                        // }

                        // //file removed
                        // })
            }
        });
    }

    // comments

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


