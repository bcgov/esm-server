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
checkIntegration ('testme').then (function (f) {
	require('../seed-data/test-integration')(f);
});

// =========================================================================
//
// Things in this section go into ALL environments
//
// =========================================================================

// -------------------------------------------------------------------------
//
// configurations
//
// -------------------------------------------------------------------------
checkIntegration ('newconfigs2').then (function () {
	require('../seed-data/newconfigs')(true);
});
checkIntegration ('commentconfigs').then (function () {
	require('../seed-data/commenting-configs')(true);
});

// -------------------------------------------------------------------------
//
// configurations
//
// -------------------------------------------------------------------------
checkIntegration ('sysroles').then (function () {
	require('../seed-data/loadroles').sysroles();
});


// -------------------------------------------------------------------------
//
// Topics
//
// -------------------------------------------------------------------------
checkIntegration ('loadtopics2').then (function () {
	require('../seed-data/loadtopics')();
});

// -------------------------------------------------------------------------
//
// Conditions
//
// -------------------------------------------------------------------------
checkIntegration ('loadconditions2').then (function () {
	require('../seed-data/loadconditions')();
});

// -------------------------------------------------------------------------
//
// artifact types
//
// -------------------------------------------------------------------------
checkIntegration ('loadartifacts54').then (function () {
	require('../seed-data/loadartifacts')();
});
// -------------------------------------------------------------------------
//
// artifacts etc for decision packages
//
// -------------------------------------------------------------------------
checkIntegration ('decisions4').then (function () {
	require('../seed-data/decisions')();
});

// -------------------------------------------------------------------------
//
// default project roles
//
// -------------------------------------------------------------------------
checkIntegration ('defaultprojectroles').then (function () {
	require('../seed-data/loadprojectroles')();
});

// -------------------------------------------------------------------------
//
// default project roles
//
// -------------------------------------------------------------------------
checkIntegration ('emailtemplates').then (function () {
  require('../seed-data/loademailtemplates')();
});

if (process.env.SEED_MEM === 'true')
{
	checkIntegration ('loadmem').then (function () {
		require('../seed-data/loadmem')();
	});
}

// =========================================================================
//
// THings in this section are split into production and non-production
//
// =========================================================================
if (process.env.NODE_ENV === 'production')
{
	// -------------------------------------------------------------------------
	//
	// add production admin user
	//
	// -------------------------------------------------------------------------
	require ('../seed-data/users-production')();
}
else
{
	// -------------------------------------------------------------------------
	//
	// add non-production test user accounts
	//
	// -------------------------------------------------------------------------
	require ('../seed-data/users-other')();
	// -------------------------------------------------------------------------
	//
	// MEM
	//
	// -------------------------------------------------------------------------
	checkIntegration ('loadmem').then (function () {
		require('../seed-data/loadmem')();
	});
	// -------------------------------------------------------------------------
	//
	// MEM
	//
	// -------------------------------------------------------------------------
	checkIntegration ('orgload').then (function () {
		require('../seed-data/orgload')();
	});

}
checkIntegration ('sysroles2').then (function () {
	require('../seed-data/loadroles').sysroles2();
});

checkIntegration ('sysroles2x1').then (function () {
	require('../seed-data/loadroles').sysroles2();
});

checkIntegration ('sysroles3').then (function () {
	require('../seed-data/loadroles').sysroles3();
});

// // check to see if the seed import executes
// // insert ajax mine project
// Integration.findOne ({module:'ajax3'}).exec()
// .then (function (row) {
//   if (!row) {

//     doConfigs ();

// 	// Project.find({name: 'Ajax Mine Project'}).remove (function () {
// 	Project.remove ({}, function () {
// 	var i = new Integration ({module:'ajax3'});
// 	i.save ();
// 		  var project = new Project({
// 			lat: 50.608817,
// 			lon: -120.405757,
// 			name: 'Ajax Mine Project',
// 			description: 'KGHM Ajax Mining Inc. proposes to develop the Ajax Project, a new open-pit copper/ gold mine located south of and adjacent to the City of Kamloops. The mine would have a production capacity of up to 24 million tonnes of ore per year, over an anticipated 23-year mine life.',
// 			type: 'Mining',
// 			location: 'Kamloops, BC',
// 			region: 'thompsonokanagan',
// 			dateCommentsClosed : '2016-04-12T06:55:00.000Z',
// 			dateCommentsOpen : '2016-01-26T08:00:00.000Z'
// 		  });
// 		  // Then save the user
// 		  project.save(function (err) {
// 			if (err) {
// 			  console.log('Failed to add ajax', err);
// 			} else {
// 			  console.log(chalk.bold.red('Ajax project added'));
// 			}
// 		  });

// 	  });










