'use strict';

var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var NotificationGroupCtrl = require ('../controllers/notificationgroup.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'notificationgroup', NotificationGroupCtrl, policy);

	app.route ('/api/notificationgroup/for/project/:project')
		.all (policy ('guest'))
		.get (routes.setAndRun (NotificationGroupCtrl, function (ctrl, req) {
			return ctrl.getForProject (req.Project._id);
		}));
};
