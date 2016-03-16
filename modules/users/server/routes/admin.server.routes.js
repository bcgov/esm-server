'use strict';

/**
 * Module dependencies.
 */
var policy = require('../policies/admin.server.policy');
var User = require('../controllers/admin.server.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
  helpers.setCRUDRoutes (app, 'user', User, policy);
  // User route registration first. Ref: #713
  // require('./users.server.routes.js')(app);

  // // Users collection routes
  // app.route('/api/user')
  //   .get(adminPolicy.isAllowed, admin.list);

  // // Single user routes
  // app.route('/api/user/:userId')
  //   .get(adminPolicy.isAllowed, admin.read)
  //   .put(adminPolicy.isAllowed, admin.update)
  //   .delete(adminPolicy.isAllowed, admin.delete);

  // // Finish by binding the user middleware
  // app.param('userId', admin.userByID);
};
