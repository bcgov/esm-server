'use strict';
var _ = require ('lodash');
var mongoose      = require('mongoose');
var Condition         = mongoose.model('Condition');
var list     = require ('./conditions.json');

module.exports = function () {
	//
	// write and replace
	//
	var total = 0;
	var count = 0;
	Condition.remove ({}, function () {
		Promise.all (list.map (function (condition) {
			count++;
			if (condition.stages === 'All' || condition.stages === '') condition.stages = 'Pre-Construction, Construction, Operations, Decommissioning';
			var stages = condition.stages.split(',');
			condition.sector = condition.sector.trim ();
			condition.stages = stages.map (function (stage) { return stage.trim(); });
			condition.pillars = condition.pillar.map (function (p) {
				var pill = p.trim();
				if (pill === 'Environmental') pill = 'Environment';
				if (pill === 'Aboriginal') pill = 'Social';
				if (pill === '') pill = 'Environment';
				if (pill === 'Economic, Aboriginal') pill = 'Economic';
				if (pill === 'Environmental, Aboriginal') pill = 'Environment';
				return pill;
			});
			condition.name = condition.code;

			var t = new Condition (condition);
			return t.save ();
		}))
		.then (function () {
			console.log ('Conditions added: ', count);
		})
		.catch (function (err) {
			console.error ('Error loading topics: ', err);
		});
	});
};
