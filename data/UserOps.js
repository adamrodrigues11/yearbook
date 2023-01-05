"use strict";
const User = require("../models/User");

class UserOps {
    UserOps() {}

    async getAllUsers() {
        let users = await User.find({});
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

    async editUserByUsername(username, newUserData, reqInfo) 
    // throw error to controller if save can't be made and handle there (redirect to edit page with cached info and errorMsg as query string) 
    {
        // const newPassword = newUserData.newPassword;
        // const newPasswordConfirm = newUserData.passwordConfirm;
        const interests = newUserData.interests.split(",").map(interest => interest.trim());

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
                    profilePhotoPath: newUserData.profilePhotoPath, 
                }, 
                function (err) {
                    if (err) {
                        console.log(err.message);
                    }
                    else {
                        console.log("Updated user info for ", username);
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
            }
        });
    }
}

module.exports = UserOps;


// comments

// async addCommentToUser(comment, username) {
//     let user = await User.findOne({ username: username });
//     user.comments.push(comment);
//     try {
//       let result = await user.save();
//       console.log("updated user: ", result);
//       const response = { user: result, errorMessage: "" };
//       return response;
//     } catch (error) {
//       console.log("error saving user: ", result);
//       const response = { user: user, errorMessage: error };
//       return response;
//     }
//   }