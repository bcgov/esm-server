'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var policy  = require ('../policies/recent-activity.policy');
var RecentActivity  = require ('../controllers/recent-activity.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'recentActivity', RecentActivity, policy);
};

