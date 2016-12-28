'use strict';
// =========================================================================
//
// Routes for organizations
//
// =========================================================================
var path                = require ('path');
var User         = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var Organization = require ('../controllers/organization.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');
var Import = require ('../controllers/organization.import.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'organization', Organization, policy);

	app.route ('/api/org/for/project/:projectid')
		.all (policy ('user'))
		.get (routes.setAndRun (Organization, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
	app.route ('/api/users/for/org/:orgid')
		.all (policy ('user'))
		.get (routes.setAndRun (User , function (model, req) {
			return model.list ({org:req.params.orgid});
		}));

	app.route ('/api/org/import').all (policy ('admin'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received users import file:",file);
				routes.setSessionContext(req)
					.then( function (opts) {
						return Import.loadOrgs(file, req, res, opts);
					}).then (routes.success(res), routes.failure(res));
			}
		});

};
