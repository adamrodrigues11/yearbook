"use strict";
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();

class RequestService {
  // Constructor
  RequestService() {}
  
  async reqHelper(req) {
    // Returns username, logged in status, and roles if authenticated
    // Returns logged out status if not authenticated.
    
    if (req.isAuthenticated()) {
      const username = req.user.username;
      // check if there are roles from the session, if not, search from database
      let roles = req.session.roles;
      if(!roles) {
        roles = await _userOps.getRolesByUsername(username);
        req.session.roles = roles;
      }
      return {
        authenticated: true,
        username: username,
        roles: roles,
      };
    }
    else {
      return { authenticated: false };
    }
  }
}
module.exports = new RequestService();