'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy       = require ('../policies/inspectionReportDetail.policy');
var Inspectionreportdetail = require ('../controllers/inspectionReportDetail.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'inspectionreportdetail', Inspectionreportdetail, policy);
};
