'use strict';


var _ = require ('lodash');
var mongoose      = require('mongoose');
var Stream        = mongoose.model('Stream');
var PhaseBase     = mongoose.model('PhaseBase');
var MilestoneBase = mongoose.model('MilestoneBase');
var ActivityBase  = mongoose.model('ActivityBase');
var Prom = require('promise');

var baseObjects = {

	"phases": [
		{
			"description": "Pre-application (permitting)",
			"name": "Pre-application (permitting)",
			"code": "pre-application",
		},
		{
			"description": "Under Construction",
			"name": "Under Construction",
			"code": "under-construction",
		},
		{
			"description": "Operating",
			"name": "Operating",
			"code": "operating",
		},
		{
			"description": "Care & Maintenance",
			"name": "Care & Maintenance",
			"code": "care-and-maintenance",
		},
		{
			"description": "Closed",
			"name": "Closed",
			"code": "closed",
		}
	]
};
var basePermissions = { };

module.exports = function (clear) {
	return new Prom (function (resolve, reject) {
	console.log ('Running configuration seeding');
	var p;
	if (clear) {
		console.log ('\t removing existing configuration objects');
		p = Stream.remove ({}).exec()
		.then (PhaseBase.remove ({}).exec());
	} else {
		p = Prom.resolve();
	}
	p.then (function () {
		console.log ('\t adding phases');
		return Prom.all (baseObjects.phases.map (function (o) {
			var m = new PhaseBase (_.extend ({},o,basePermissions));
			return m.save ();
		}));
	})
	.then (resolve, reject);
	});
};



