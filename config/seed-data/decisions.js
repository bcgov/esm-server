'use strict';
var _             = require ('lodash');
var mongoose      = require('mongoose');
var ArtifactType  = mongoose.model('ArtifactType');
var ActivityBase  = mongoose.model('ActivityBase');
var MilestoneBase = mongoose.model('MilestoneBase');
var Template      = mongoose.model('Template');
var list          = require ('./decisionslist');
var promise       = require('promise');
var util          = require('util');

module.exports = function () {
	//
	// write and replace
	//
	var total = 0;
	var count = 0;
	// promise.all (list.activitybases.map (function (activity) {
	// 	console.log ('removing activity base ',activity.code);
	// 	return ActivityBase.remove ({code:activity.code});
	// }))
	// .then (function () {
	// 	return promise.all (list.activitybases.map (function (activity) {
	// 		console.log ('adding activity base ',activity.code);
	// 		var a = new ActivityBase (activity);
	// 		return a.save ();
	// 	}));
	// })
	// .then (function () {
	// 	return promise.all (list.milestonebases.map (function (milestone) {
	// 		console.log ('adding milestone base ',milestone.code);
	// 		var a = new MilestoneBase (milestone);
	// 		return a.save ();
	// 	}));
	// })
	promise.resolve ()
	.then (function () {
		console.log('1');
		return promise.all (list.artifacttypes.map (function (m) {
			return ArtifactType.find({ code:m.code }).remove().exec();
		}));
	})
	.then (function () {
		return promise.all (list.artifacttypes.map (function (m) {
			var a = new ArtifactType (m);
			return a.save ();
		}));
	})

	.then (function () {
		return promise.all (list.activities.map (function (m) {
			return ActivityBase.find({ code:m.code }).remove().exec();
		}));
	})
	.then (function () {
		return promise.all (list.activities.map (function (m) {
			var a = new ActivityBase (m);
			return a.save ();
		}));
	})

	.then (function () {
		return promise.all (list.artifacttypes.map (function (m) {
			return MilestoneBase.find({ code:m.code }).remove().exec();
		}));
	})
	.then (function () {
		return promise.all (list.artifacttypes.map (function (m) {
			var a = new MilestoneBase ({
				code         : m.code,
				name         : m.code,
				description  : m.code,
				artifactType : m.code
			});
			return a.save ();
		}));
	})

	.then (function () {
		return promise.all (list.templates.map (function (m) {
			return Template.find({ code:m.code }).remove().exec();
		}));
	})
	.then (function () {
		return promise.all (list.templates.map (function (m) {
			var a = new Template (m);
			return a.save ();
		}));
	})


	.then (function () {
		console.log ('decisions all done ');
	})
	.catch (function (err) {
		console.log ('decisions oops, something went wrong', err);
	});

};
