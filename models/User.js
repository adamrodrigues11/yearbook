const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;

// Comment Schema
const commentSchema = new Schema({
    commentAuthor: String,
    commentBody: String,
  });

  // User Schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            index: true,
        },
        email: {
            type: String,
            index: true,
        },
        // password: {
        //     type: String,
        // },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        interests: {
            type: Array,
        },
        profilePhotoPath: {
            type: String
        },
        roles : {
            type: Array,
        },
        comments: [commentSchema],
    },
    { 
        collection: "Users" 
    }
);

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;