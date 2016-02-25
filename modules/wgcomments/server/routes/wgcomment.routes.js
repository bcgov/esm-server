'use strict';
// =========================================================================
//
// Routes for wgcomments
//
// =========================================================================
var policy  = require ('../policies/wgcomment.policy');
var WGComment  = require ('../controllers/wgcomment.controller');
var WGCommentPeriod  = require ('../controllers/wgcommentperiod.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'wgcomment', WGComment, policy);
	helpers.setCRUDRoutes (app, 'wgcommentperiod', WGCommentPeriod, policy);
	app.route ('/api/new/wgcommentperiod/for/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new WGCommentPeriod (req.user);
			p.newForProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
};

