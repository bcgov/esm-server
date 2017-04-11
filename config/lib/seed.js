'use strict';

var mongoose = require('mongoose');
var chalk         = require('chalk');
var _             = require('lodash');
var Integration  = mongoose.model ('Integration');
var Template  = mongoose.model ('Template');
var promise = require ('promise');

console.log(chalk.bold.red('Warning:  Database seeding is turned on'));

// =========================================================================
//
// !!!! IMPORTANT !!!!
//
// This will drop schemas first if set to true
//
// =========================================================================
var DROP_SCHEMAS = false;

require('../seed-data/dropschemas')(DROP_SCHEMAS);

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
	checkIntegration('testme').then(function (f) {
		require('../seed-data/test-integration')(f);
	});

// -------------------------------------------------------------------------
//
// configurations
//
// -------------------------------------------------------------------------
	checkIntegration('newconfigs3').then(function () {
		require('../seed-data/newconfigs')(true);
	});
	checkIntegration('commentconfigs1').then(function () {
		require('../seed-data/commenting-configs')(true);
	});

// -------------------------------------------------------------------------
//
// configurations
//
// -------------------------------------------------------------------------
	checkIntegration('sysroles').then(function () {
		require('../seed-data/loadroles').sysroles();
	});


// -------------------------------------------------------------------------
//
// Topics
//
// -------------------------------------------------------------------------
	checkIntegration('loadtopics5').then(function () {
		require('../seed-data/loadtopics')();
	});

// -------------------------------------------------------------------------
//
// artifact types
//
// -------------------------------------------------------------------------
	checkIntegration('loadartifacts81').then(function () {
		require('../seed-data/loadartifacts')();
	});
// -------------------------------------------------------------------------
//
// artifacts etc for decision packages
//
// -------------------------------------------------------------------------
	checkIntegration('decisions7').then(function () {
		require('../seed-data/decisions')();
	});

// -------------------------------------------------------------------------
//
// default project roles
//
// -------------------------------------------------------------------------
	checkIntegration('defaultprojectroles').then(function () {
		require('../seed-data/loadprojectroles')();
	});

// -------------------------------------------------------------------------
//
// default project roles
//
// -------------------------------------------------------------------------
	checkIntegration('emailtemplates3').then(function () {
		require('../seed-data/loademailtemplates')();
	});

	if (process.env.SEED_MEM === 'true') {
		checkIntegration('loadmem').then(function () {
			require('../seed-data/loadmem')();
		});
	}

// =========================================================================
//
// THings in this section are split into production and non-production
//
// =========================================================================
	if (process.env.NODE_ENV === 'production') {
		// -------------------------------------------------------------------------
		//
		// add production admin user
		//
		// -------------------------------------------------------------------------
		require('../seed-data/users-production')();
	}
	else {
		// -------------------------------------------------------------------------
		//
		// add non-production test user accounts
		//
		// -------------------------------------------------------------------------
		require('../seed-data/users-other')();
		// -------------------------------------------------------------------------
		//
		// MEM
		//
		// -------------------------------------------------------------------------
		checkIntegration('loadmem').then(function () {
			require('../seed-data/loadmem')();
		});
		// -------------------------------------------------------------------------
		//
		// MEM
		//
		// -------------------------------------------------------------------------
		checkIntegration('orgload').then(function () {
			require('../seed-data/orgload')();
		});

	}
	checkIntegration('sysroles2').then(function () {
		require('../seed-data/loadroles').sysroles2();
	});

	checkIntegration('sysroles2x1').then(function () {
		require('../seed-data/loadroles').sysroles2();
	});

	checkIntegration('sysroles3').then(function () {
		require('../seed-data/loadroles').sysroles3();
	});


	checkIntegration('app-20160727.10').then(function () {
		require('../seed-data/application')();
	});

	checkIntegration('folders-20170216.21').then(function () {
		require('../seed-data/folders')();
	});
	checkIntegration('codelists-20170410').then(function () {
		require('../seed-data/codelist')();
	});

};

// =========================================================================
//
// permissions & roles
//
// =========================================================================

checkIntegration ('defaults14')
	.then(function(){
		require('../seed-data/defaults')()
			.then(seedingAsync);
		},
		function() {
			// defaults have been seeded, but we should check the other stuff...
			seedingAsync();
		}
	);
