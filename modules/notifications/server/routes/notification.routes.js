'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var NotificationCtrl = require ('../controllers/notification.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'notification', NotificationCtrl, policy, undefined, {all:'guest'});

	app.route ('/api/notification/for/project/:project')
		.all (policy ('guest'))
		.get (routes.setAndRun (NotificationCtrl, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));

	app.route ('/api/notification/for/group/:group')
		.all (policy ('guest'))
		.get (routes.setAndRun (NotificationCtrl, function (ctrl, req) {
			return ctrl.getForGroup (req.Group._id);
		}));

};
