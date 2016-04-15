'use strict';
// =========================================================================
//
// Routes for invitations
//
// =========================================================================
var policy  = require ('../policies/invitation.policy');
var Invitation  = require ('../controllers/invitation.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'invitation', Invitation, policy);
};

