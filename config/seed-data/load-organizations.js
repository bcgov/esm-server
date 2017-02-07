'use strict';

var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');
var items = require('./load-organizations-data');
var _ = require('lodash');


module.exports = function () {
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
};
