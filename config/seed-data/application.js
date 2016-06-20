'use strict';

var mongoose = require('mongoose');
var Application    = mongoose.model('Application');
var Prom = require('promise');

module.exports = function () {
	return new Prom (function (resolve, reject) {
		console.log ('Running application seeding');
		var a = new Application ({
			code        : 'application',
			read        : ['public', '*'],
			isPublished : true
		});
		a.save ().then (resolve, reject);
	});
};
