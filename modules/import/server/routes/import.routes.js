'use strict';

var _      = require ('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

var Import   = require ('../controllers/import.controller');

module.exports = function (app) {

	app.route ('/api/import')
		.all (policy ('guest'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				routes.setSessionContext(req)
					.then( function (opts) {
						return new Import(file, req, res, opts);
					})
					.then (function (data) {
						res.json (data);
					}, function(err) {
						res.status(500).send(err.message || 'Error importing file.');
					});
			} else {
				res.status(500).send('No file specified.');
			}
		});


};
