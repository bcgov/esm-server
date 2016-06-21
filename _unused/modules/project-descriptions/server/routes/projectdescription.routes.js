'use strict';
// =========================================================================
//
// Routes for projectdescriptions
//
// =========================================================================
var policy  = require ('../policies/projectdescription.policy');
var ProjectDescription  = require ('../controllers/projectdescription.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'projectdescription', ProjectDescription, policy);
};

