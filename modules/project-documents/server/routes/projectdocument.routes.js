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
	app.route ('/api/projectdocument/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new ProjectDocument (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

