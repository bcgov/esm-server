'use strict';


var _ = require ('lodash');
var mongoose      = require('mongoose');
var MilestoneBase = mongoose.model('MilestoneBase');
var ActivityBase  = mongoose.model('ActivityBase');
var Prom = require('promise');

var baseObjects = {
	activities: [{
		code: 'public-comment',
		name: 'Comment On Artifact',
		description: 'Comment On Artifact',
		state: 'p.artifact.public-comment'
	},{
		code: 'comment',
		name: 'Comment On Artifact',
		description: 'Comment On Artifact',
		state: 'p.artifact.comment'
	}],
	"milestones": [{
	    code: 'public-comment-period',
	    name: 'Public Comment Period',
	    description: 'Public Comment Period',
	    activities: ['public-comment'],
	    type: 'Process'
	},{
	    code: 'comment-period',
	    name: 'Internal Comment Period',
	    description: 'Internal Comment Period',
	    activities: ['comment'],
	    type: 'Process'
	}]
};
module.exports = function (clear) {
	return new Prom (function (resolve, reject) {
	console.log ('Running commenting configuration seeding');
	Prom.resolve()
	.then (function () {
		console.log ('\t adding milestones');
		return Prom.all (baseObjects.milestones.map (function (o) {
			var m = new MilestoneBase (o);
			return m.save ();
		}));
	})
	.then (function () {
		console.log ('\t adding activities');
		return Prom.all (baseObjects.activities.map (function (o) {
			var m = new ActivityBase (o);
			return m.save ();
		}));
	})
	.then (resolve, reject);
	});
};



