'use strict';

var mongoose = require('mongoose');
var chalk         = require('chalk');
var _             = require('lodash');
var Integration  = mongoose.model ('Integration');
var promise = require ('promise');

console.log(chalk.bold.red('Warning:  Database seeding is turned on'));


// =========================================================================
//
// This will force all integrations if set to true
//
// =========================================================================
var FORCE = false;

// -------------------------------------------------------------------------
//
// return a function that can be used by a sub program to write its output
// into the integration record
//
// -------------------------------------------------------------------------
var writeFunction = function (iDocument) {
	return function (data, stop) {
		iDocument.output += ( data + "<br>\n" );
		if (stop) {
			return iDocument.save ();
		}
	};
};
// -------------------------------------------------------------------------
//
// check if the integration was performed, can override
//
// -------------------------------------------------------------------------
var checkIntegration = function (name, override) {
	return new promise (function (resolve, reject) {
		if (!FORCE && override) return resolve (true);
		Integration.findOne ({module:name}, function (err, row) {
			if (err) {
				console.error ('Error seeding '+name+' : ', err);
				reject (err);
			}
			else if (!FORCE && row) {
				console.log ('seeding :' + name + ' has already been performed');
				reject ('seeding :' + name + ' has already been performed');
			}
			else {
				console.log ('seeding :' + name);
				var i = new Integration ({module:name});
				i.save ();
				//
				// resolve with the function that can write to Integration
				//
				resolve (writeFunction (i, name));
			}
		});
	});
};

var seedingAsync = function() {
	console.log('begin asynchronous seeding...');

	require('../seed-data/load-adminuser')();

	checkIntegration('configs').then(function () {
		require('../seed-data/load-configs')(true);
	});

	checkIntegration('application').then(function () {
		require('../seed-data/load-application')();
	});


	checkIntegration('emailtemplates').then(function () {
		require('../seed-data/load-emailtemplates')();
	});

	function loadData(fileRef) {
		console.log("Load ...", fileRef);
		return new promise(function (resolve, reject) {
			try {
				resolve(require(fileRef)());
			} catch (error) {
				console.error(error);
				reject(error);
			}
			resolve();
		});
	}

	checkIntegration('organizations')
		.then(function () {
			return loadData('../seed-data/load-organizations');
		})
		.then(function () {
			return checkIntegration('projects');
		})
		.then(function () {
			return loadData('../seed-data/load-projects');
		})
		.then(function () {
			console.log("Finished seeding projects and dependent objects");
		});

	console.log("load workers");
	try {
		var loaderWorker = require('../seed-data/load-workers');
		loaderWorker.inspections();
		loaderWorker.authorizations();
	}catch(e) {
		console.error(e);
	}


};

// =========================================================================
//
// permissions & roles
//
// =========================================================================

checkIntegration ('defaults')
	.then(function(){
		require('../seed-data/load-defaults')()
			.then(seedingAsync);
		},
		function() {
			// defaults have been seeded, but we should check the other stuff...
			seedingAsync();
		}
	);
