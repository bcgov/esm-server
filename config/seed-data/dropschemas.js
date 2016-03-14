'use strict';

var mongoose = require ('mongoose');
var chalk         = require('chalk');
var promise = require ('promise');
var schemas = [
	'activities',
	'activitybases',
	'alerts',
	'commentperiods',
	'comments',
	'complaints',
	'conditions',
	'contacts',
	'documents',
	'integrations',
	'milestonebases',
	'milestones',
	'organizations',
	'phasebases',
	'phases',
	'projects',
	'roles',
	'streams',
	'topics',
	'users'
];


var dropSchema = function (name) {
	return new promise (function (resolve, reject) {
		mongoose.connection.collections[name].drop(function (err) {
			//
			// do not care about errors
			//
			resolve (true);
		});
	});
};

module.exports = function (doDrop) {
	return new promise (function (resolve, reject) {
		if (!doDrop) return resolve (true);
		else {
			console.log (chalk.bold.red ('Warning:  Dropping Schemas !!!'));
			var allDropPromises = schemas.map (function (schemaName) {
				return dropSchema (schemaName);
			});
			promise.all (allDropPromises)
			.then (resolve, reject);
		}
	});
};

