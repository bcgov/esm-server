'use strict';
// =========================================================================
//
// Routes for invitations
//
// =========================================================================
var Invitation  = require ('../controllers/invitation.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'invitation', Invitation, policy);
};

