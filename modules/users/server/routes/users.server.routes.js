'use strict';

module.exports = function (app) {
  // User Routes
  var users   = require('../controllers/users.server.controller');
  // TODO: Re-enable this
  // var policy  = require ('../../policies/contact.policy');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  app.route('/api/user/alert').get(function(req,res){res.json([]);});

  // Import logic
  app.route ('/api/users/import')//.all (policy.isAllowed)
  .post (function (req, res) {
    var file = req.files.file;
    if (file) {
      // console.log("Received contact import file:",file);
      users.loadContacts(file, req, res);
    }
  });

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
