'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.authentication.user.controller');

  // routes that will be protected by Siteminder.
  // Siteminder will have authenticated the users and added identifying header information when we get into our handlers...
  
  app.route('/authentication/signin').get(core.signIn);
  app.route('/authentication/accept/:token').get(core.acceptInvitation);
	app.route('/authentication/headers').get(core.logHeaders);

};
