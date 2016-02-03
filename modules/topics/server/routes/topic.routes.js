'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy       = require ('../policies/topic.policy');
var Topic     = require ('../controllers/topic.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'topic', Topic, policy);
};
