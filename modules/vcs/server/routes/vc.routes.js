'use strict';
// =========================================================================
//
// Routes for vcs
//
// =========================================================================
var policy  = require ('../policies/vc.policy');
var Vc  = require ('../controllers/vc.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'vc', Vc, policy);
};

