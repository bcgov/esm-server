'use strict';

var ConnectComment = require('../controllers/connect.controller');
var _ = require('lodash');
var routes = require('../../../core/server/controllers/core.routes.controller');
var policy = require('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {

	// support new (and get?) so the client form can load.
	routes.setCRUDRoutes(app, 'comment', ConnectComment, policy, ['new', 'get'], {all: 'guest'});

	// The only other route needed, at this time, is post.
	// At some future date we'll add ability to list. But first we need support for users, etc.
	app.route('/api/comment')
		.all(policy('guest'))
		.post(function (req, res) {
			var honeypot = req.body.subject;
			if (honeypot) {
				console.log("ConnectComment SPAMMER has sent form with honey pot");
				// We return success after a lonnnggg delay without adding anything to the db!
				// Don't let the spammer know they failed or else they just change their approach!
				setTimeout(function () {
					routes.setSessionContext(req)
						.then(routes.success(res), routes.failure(res));
				}, 3000);
			} else {
				//console.log("API Comment create");
				routes.setSessionContext(req)
					.then(function (opts) {
						var model = new ConnectComment(opts);
						return model.create(req.body);
					})
					.then(routes.success(res), routes.failure(res));
			}
		});
};
