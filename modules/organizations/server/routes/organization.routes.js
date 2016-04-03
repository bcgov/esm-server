'use strict';
// =========================================================================
//
// Routes for organizations
//
// =========================================================================
var path                = require ('path');
var User         = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var policy       = require ('../policies/organization.policy');
var Organization = require ('../controllers/organization.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'organization', Organization, policy);

	app.route ('/api/org/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Organization (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
	});
	app.route ('/api/users/for/org/:orgid').all (policy.isAllowed)
		.get (function (req, res) {
			// console.log ('org id passed was ', req.params.orgid);
			(new User (req.user)).findMany ({org:req.params.orgid})
			.then (helpers.success(res), helpers.failure(res));
	});
};
