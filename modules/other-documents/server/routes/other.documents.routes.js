'use strict';

var OtherDocuments     = require ('../controllers/other.documents.controller');
var _           = require ('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'otherdocs', OtherDocuments, policy, null, {all:'guest'});

	app.route ('/api/otherdocs/project/projectCode/:projectcode')
		.all (policy ('guest'))
		.get (routes.setAndRun (OtherDocuments, function (model, req) {
			return model.getForProjectCode (req.params.projectcode);
		}));

	app.route ('/api/otherdocs/project/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (OtherDocuments, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));

	app.route ('/api/otherdocs/agency/:agencyid')
		.all (policy ('guest'))
		.get (routes.setAndRun (OtherDocuments, function (model, req) {
			return model.getForAgency (req.params.agencyid);
		}));


};

