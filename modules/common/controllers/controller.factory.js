'use strict';


var path     = require('path');
var _        = require ('lodash');

var types = {};
types['commentperiods'] = require(path.resolve('./modules/project-comments/server/controllers/commentperiod.controller'));
types['comments'] = require(path.resolve('./modules/project-comments/server/controllers/comment.controller'));
types['documents'] = require(path.resolve('./modules/documents/server/controllers/document.controller'));
types['artifacts'] = require(path.resolve('./modules/artifacts/server/controllers/artifact.controller'));
types['features'] = require(path.resolve('./modules/features/server/controllers/feature.controller'));
types['activities'] = require(path.resolve('./modules/activities/server/controllers/activity.controller'));
types['users'] = require(path.resolve('./modules/users/server/controllers/users.server.controller'));
types['projects'] = require(path.resolve('./modules/projects/server/controllers/project.controller'));


var getInstance = function(req, objecttype) {
	return new Promise(function(fulfill, reject) {
		var ControllerClass = types[objecttype];
		if (!ControllerClass) {
			reject(new Error('Could not load controller class for ' + objecttype + '.'));
		} else {
			var obj = new ControllerClass(req.user);
			if (!obj) {
				reject(new Error('Could not create instance of ' + objecttype +'.'));
			} else {
				fulfill(obj);
			}
		}
	});
};

var getOne = function(req, objecttype, objectid) {
	return new Promise(function(fulfill, reject) {
		getInstance(req, objecttype)
			.then(function(inst) {
				return inst.findById(id);
			})
			.then(function(obj) {
				if (!obj) {
					reject(new Error('Could not find type of ' + objecttype + ' with id = "' + objectid.toString() + '".'));
				} else {
					fulfill(obj);
				}
			});
	});
};


var getMany = function(req, objecttype, objectids) {
	return new Promise(function(fulfill, reject) {
		getInstance(req, objecttype)
			.then(function(inst) {
				var objectidsArray = _.isArray (objectids) ? objectids : [objectids];
				var q = {'_id': {$in: objectidsArray}};
				return inst.findMany(q);
			})
			.then(function(obj) {
				if (!obj) {
					reject(new Error('Could not find many types of ' + objecttype + '.'));
				} else {
					fulfill(obj);
				}
			});
	});
};

module.exports = {
	getInstance: getInstance,
	getOne: getOne,
	getMany: getMany
};
