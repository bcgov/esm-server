'use strict';

var Project     = require ('../controllers/project.controller');
var _           = require ('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'project', Project, policy, null, {all:'guest'});

	app.route ('/api/project/bycode/:projectcode')
		.all (policy ('guest'))
		.get (routes.setAndRun(Project, function (model, req) {
			return model.one ({code:req.params.projectcode});
		}));

};

