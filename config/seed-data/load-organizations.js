'use strict';

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');
var items = require('./load-organizations-data');
var _ = require('lodash');


module.exports = function () {
	console.log("This module has been replaced by load-worker.  Once fully tested we'll delete this module.");
	return Promise.resolve();
};

function obsolete() {
	var allPromises = [];
	_.each(items, function (item) {
		var p = new Promise(function(resolve, reject) {
			var org = new Organization(item);
			org.save();
			resolve(org);
		});
		allPromises.push(p);
	});
	return Promise.all(allPromises);
}
