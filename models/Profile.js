const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema(
    {
        name: { type: String, required: true },
        interests: Array,
        imgPath: String
    },
    { 
        collection: "Profiles" 
    }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;