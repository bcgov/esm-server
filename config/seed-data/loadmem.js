'use strict';

var mongoose = require('mongoose');
var phases   = require ('./memphases');
var projects = require ('./memprojects');
var Phase    = mongoose.model('Phase');
var Project  = mongoose.model('Project');
var _ = require ('lodash');

module.exports = function () {

	_.each (phases, function (ph) {
		var phase = new Phase (ph);
		phase.save ();
	});
	// _.each (projects, function (p) {
	// 	var project = new Project ();
	// 	//
	// 	// fill out the base project information with some other stuff
	// 	//
	// 	if ( p.status.match (/^operating/) ) { project.status = 'Certified'; }
	// 	else if ( p.status.match (/^closed/)) { project.status = 'Decommissioned'; }
	// 	else { project.status = 'In Progress'; }
	// 	//
	// 	// name description code
	// 	//
	// 	project.name = p.name;
	// 	project.description = p.description;
	// 	project.code = p.permit.toLowerCase ();
	// 	if (project.code === 'N/A') {
	// 		project.code = p.name.toLowerCase ().replace (' ', '-').substr (0, 10);
	// 	}
	// 	//
	// 	// phases
	// 	//
	// 	project.phases = [];
	// 	_.each (phases, function (ph) {
	// 		var phase = new Phase (ph);
	// 		project.phases.push (phase._id);
	// 		phase.save ();
	// 	});
	// 	//
	// 	// type
	// 	//
	// 	project.type = 'Mine';
	// 	//
	// 	// region
	// 	//
	// 	project.region = p.memRegion;
	// 	//
	// 	// phases
	// 	//
	// 	project.currentPhase = project.phases[0];
	// 	//
	// 	// lats and lons
	// 	//
	// 	project.lat = p.lat;
	// 	project.lon = p.lon;
	// 	//
	// 	// roles
	// 	//
	// 	project.roles = ['mem', 'public'];
	// 	//
	// 	// cram in all other infor into the description
	// 	//
	// 	var od = project.description;
	// 	project.description = 'Permit Number: '+p.permit+"\n";
	// 	project.description += 'Project Name: '+p.name+"\n";
	// 	project.description += 'Proponent/Operator: '+p.prop+"\n";
	// 	project.description += 'Ownership: '+p.ownership+"\n";
	// 	project.description += 'Latitude [decimal degrees N]: '+p.lat+"\n";
	// 	project.description += 'Longitude [decimal degrees E]: '+p.lon+"\n";
	// 	project.description += 'Status: '+p.status+"\n";
	// 	project.description += 'Commodity/ies: '+p.comm+"\n";
	// 	project.description += 'MEM Region: '+p.memRegion+"\n";
	// 	project.description += 'Tailings Impoundments: '+p.tail+"\n";
	// 	project.description += 'Description: '+p.description+"\n";
	// 	//
	// 	// access
	// 	//
	// 	project.read = ['public'];
	// 	project.submit = ['mem'];
	// 	//
	// 	// save
	// 	//
	// 	project.save ();

	// });

};
