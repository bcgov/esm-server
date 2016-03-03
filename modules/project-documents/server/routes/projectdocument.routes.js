'use strict';
// =========================================================================
//
// Routes for projectdocuments
//
// =========================================================================
var policy  = require ('../policies/projectdocument.policy');
var ProjectDocument  = require ('../controllers/projectdocument.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'projectdocument', ProjectDocument, policy);
};

