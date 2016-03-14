'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy       = require ('../policies/inspectionReport.policy');
var Inspectionreport = require ('../controllers/inspectionReport.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'inspectionreport', Inspectionreport, policy);
};
