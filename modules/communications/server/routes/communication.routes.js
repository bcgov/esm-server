'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var Communication = require ('../controllers/communication.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'communication', Communication, policy);

	app.route ('/api/communication/for/project/:project')
		.all (policy ('guest'))
		.get (routes.setAndRun (Communication, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));

	app.route ('/api/communication/for/group/:group')
		.all (policy ('guest'))
		.get (routes.setAndRun (Communication, function (ctrl, req) {
			return ctrl.getForGroup (req.Group._id);
		}));

	app.route ('/api/communication/for/delivery/:communication')
		.all (policy ('user'))
		.put (routes.setAndRun (Communication, function (ctrl, req) {
			return ctrl.deliver (req.Communication);
		}));

	app.route ('/api/communication/for/rsvp/:communication')
		.all (policy ('user'))
		.put (routes.setAndRun (Communication, function (ctrl, req) {
			return ctrl.deliverInvitation (req.Communication);
		}));
};
