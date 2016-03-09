'use strict';
var _ = require ('lodash');
var mongoose      = require('mongoose');
var Topic         = mongoose.model('Topic');
var topiclist     = require ('./topiclist');

module.exports = function () {
	//
	// write and replace
	//
	var total = 0;
	var count = 0;
	Topic.remove ({}, function () {
		Promise.all (topiclist.map (function (topic) {
			count++;
			var t = new Topic (topic);
			return t.save ();
		}))
		.then (function () {
			console.log ('Topics added: ', count);
		})
		.catch (function (err) {
			console.error ('Error loading topics: ', err);
		});
	});
};
