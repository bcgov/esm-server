'use strict';
// =========================================================================
//
// Routes for descriptions
//
// =========================================================================
var policy  = require ('../policies/description.policy');
var Description  = require ('../controllers/description.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'description', Description, policy);
};

