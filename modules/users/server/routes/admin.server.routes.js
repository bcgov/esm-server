'use strict';

/**
 * Module dependencies.
 */
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var UserCtrl = require('../controllers/admin.server.controller');

module.exports = function (app) {
  routes.setCRUDRoutes(app, 'user', UserCtrl, policy, null, {all:'user',get:'user'});

  // just create a new user if required... add them to the roles...
  app.route('/api/onboardUser')
    .all (policy ('user'))
    .all (routes.setModel (UserCtrl, 'userCtl'))
    .post (function (req, res) {
      //
      // TBD ROLES
      // this all has to be rewritten
      //
      Promise.then.resolve ({}).then(routes.success(res), routes.failure(res));
    });
};
