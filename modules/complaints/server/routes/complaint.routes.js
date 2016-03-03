'use strict';
// =========================================================================
//
// Routes for complaints
//
// =========================================================================
var policy  = require ('../policies/complaint.policy');
var Complaint  = require ('../controllers/complaint.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'complaint', Complaint, policy);
};

