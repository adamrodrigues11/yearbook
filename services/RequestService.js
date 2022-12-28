// I'm getting the username from passport mongoose and roles from the session now
// need to figure out how to not read roles from the db once they area available in the session


"use strict";
class RequestService {
  // Constructor
  RequestService() {}
  
  reqHelper(req) {
    
    // Send username and login status to view if authenticated.
    if (req.isAuthenticated()) {
      const roles = req.session.roles ?? [];
      return {
        authenticated: true,
        username: req.user.username,
        roles: roles,
      };
    }
    // Send logged out status to form if not authenticated.
    else {
      return { authenticated: false };
    }
  }
}
module.exports = new RequestService();