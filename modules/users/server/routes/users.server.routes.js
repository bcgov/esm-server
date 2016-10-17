'use strict';

// User Routes
var DocumentClass  = require ('../../../documents/server/controllers/core.document.controller');
var users   = require('../controllers/users.server.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {

	// Setting up the users profile api
	app.route('/api/users/me').get(users.me);
	app.route('/api/users').put(users.update);
	app.route('/api/users/accounts').delete(users.removeOAuthProvider);
	app.route('/api/users/password').post(users.changePassword);
	app.route('/api/users/picture').post(users.changeProfilePicture);

	app.route('/api/user/alert').get(function(req,res){res.json([]);});

	// Import logic
	app.route ('/api/users/import').all (policy ('admin'))
	.post (function (req, res) {
		var file = req.files.file;
		if (file) {
			// console.log("Received users import file:",file);
			routes.setSessionContext(req)
			.then( function (opts) {
				return users.loadUsers(file, req, res, opts);
			}).then (routes.success(res), routes.failure(res));
		}
	});
	// Import logic
	app.route ('/api/groupusers/import').all (policy ('admin'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received groupusers import file:",file);
				routes.setSessionContext(req)
				.then( function (opts) {
					return users.loadGroupUsers(file, req, res, opts);
				}).then (routes.success(res), routes.failure(res));
			}
		});
	// Import logic
	app.route ('/api/userroles/project/import').all (policy ('admin'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				routes.setSessionContext(req)
					.then( function (opts) {
						return users.loadProjectUserRoles(file, req, res, opts);
					}).then (routes.success(res), routes.failure(res));
			}
		});
	app.route ('/api/userroles/system/import').all (policy ('admin'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				routes.setSessionContext(req)
					.then( function (opts) {
						return users.loadSystemUserRoles(file, req, res, opts);
					}).then (routes.success(res), routes.failure(res));
			}
		});
	app.route ('/api/users/sig/upload').all (policy ('user'))
		.post (routes.setAndRun (DocumentClass, function (model, req) {
			return new Promise (function (resolve, reject) {
				var file = req.files.file;
				if (file) {
					var opts = { oldPath: file.path, projectCode: 'signatures'};
					routes.moveFile (opts)
					.then (function (newFilePath) {
						return model.create ({
							// These are automatic as it actually is when it comes into our system
							documentSource 			: "SIGNATURE",
							internalURL             : newFilePath,
							internalOriginalName    : file.originalname,
							internalName            : file.name,
							internalMime            : file.mimetype,
							internalExt             : file.extension,
							internalSize            : file.size,
							internalEncoding        : file.encoding
						});
					})
					.then( function (doc) {
						return model.publish(doc);
					})
					.then (resolve, reject);
				}
				else {
					reject ("no file to upload");
				}
			});
		}));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
