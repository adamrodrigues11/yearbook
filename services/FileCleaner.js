const fs = require('fs');

// need to fix this up so that we take the absolute path on the local drive
// also need to check first to make sure no other profile in the database uses this profilePic
// might be better to run periodically as a server maintenance task, rather than every time a profile is edited or deleted?


class FileCleaner {
    // Constructor
    FileCleaner() {}

    async deleteOldProfilePic(profilePicPath) {
        if(!profilePicPath) {
            return;
        }
        fs.unlink(profilePicPath, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }
}
module.exports = new FileCleaner();