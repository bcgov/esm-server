'use strict';
// =========================================================================
//
// Routes for contacts
//
// =========================================================================
var policy  = require ('../policies/contact.policy');
var Contact  = require ('../controllers/contact.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'contact', Contact, policy);
	app.route ('/api/contact/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Contact (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

