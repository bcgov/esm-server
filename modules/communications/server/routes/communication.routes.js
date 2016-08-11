'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var CommunicationCtrl = require ('../controllers/communication.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'communication', CommunicationCtrl, policy);

	app.route ('/api/communication/for/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (CommunicationCtrl, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));

	app.route ('/api/communication/for/group/:group')
		.all (policy ('user'))
		.get (routes.setAndRun (CommunicationCtrl, function (ctrl, req) {
			return ctrl.getForGroup (req.Group._id);
		}));

};
