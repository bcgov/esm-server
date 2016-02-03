'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy       = require ('../policies/task.policy');
var Taskbase = require ('../controllers/taskbase.controller');
var Task     = require ('../controllers/task.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'taskbase', Taskbase, policy);
	helpers.setCRUDRoutes (app, 'task', Task, policy);
};
