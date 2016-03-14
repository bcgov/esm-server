'use strict';
// =========================================================================
//
// Routes for topics
//
// =========================================================================
var policy  = require ('../policies/topic.policy');
var Topic  = require ('../controllers/topic.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'topic', Topic, policy);
	app.route ('/api/topics/for/pillar/:pillar').all (policy.isAllowed)
		.get (function (req, res) {
			var o = new Topic (req.user);
			o.findMany ({pillar:req.params.pillar}).then (helpers.success(res), helpers.failure(res));
		});
};

