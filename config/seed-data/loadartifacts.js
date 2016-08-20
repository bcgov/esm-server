'use strict';
var _ = require('lodash');
var mongoose = require('mongoose');
var ArtifactType = mongoose.model('ArtifactType');
var MilestoneBase = mongoose.model('MilestoneBase');
var Template = mongoose.model('Template');
var list = require('./artifactslist');
var listTwo = require('./artifactslist2');
var promise = require('promise');
var util = require('util');

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
	promise.resolve()
		.then(function () {
			return mongoose.connection.collections.artifacttypes.drop();
		})
		.then(function () {
			return mongoose.connection.collections.templates.drop();
		})
		.then(function () {
			return promise.all(list.templates.map(function (template) {
				console.log('adding template ', template.documentType);
				var a = new Template(template);
				return a.save();
			}));
		})
		.then(function () {
			return promise.all(list.artifacttypes.map(function (artifacttype) {
				// Dont' force the template seed if it's false
				if (artifacttype.hasOwnProperty("isTemplate")) {
					artifacttype.isTemplate = artifacttype.isTemplate;
				} else {
					artifacttype.isTemplate = true;
				}
				
				if (!artifacttype.stages) {
					artifacttype.stages = list.stages;
				}
				var a = new ArtifactType(artifacttype);
				return a.save();
			}));
		})
		.then(function () {
			console.log('all done adding artifacts from list 1');
		})
		.then(function () {

				var a = _.map(listTwo.artifacttypes, function (artifacttype) {
					return new promise(function (fulfill, reject) {
						ArtifactType.findOne({code: artifacttype.code}, function (err, arttype) {
							if (err) {
								//console.log('error on find. ' + JSON.stringify(artifacttype) + ': ' + err);
								reject(err);
							}
							else {
								if (!arttype) {
									// insert new one...
									if (artifacttype.hasOwnProperty("isTemplate")) {
										artifacttype.isTemplate = artifacttype.isTemplate;
									} else {
										artifacttype.isTemplate = true;
									}
									
									if (!artifacttype.stages) {
										artifacttype.stages = list.stages;
									}

									arttype = new ArtifactType(artifacttype);
									arttype.save(function (err) {
										if (err) {
											//console.log('error on find & save. ' + JSON.stringify(arttype) + ': ' + err);
											reject(err);
										} else {
											//console.log('saved ' + arttype.code);
											fulfill(arttype);
										}
									});

								} else {
									//console.log('artifact exists ' + arttype.code);
									fulfill(arttype);
								}
							}
						});
					});

				});
				return promise.all(a);
		})
		.then(function () {
			console.log('all done adding artifacts from list 2');
		})
		.catch(function (err) {
			console.log('oops, something went wrong', err);
		});

};
