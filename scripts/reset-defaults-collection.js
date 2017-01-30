'use strict';
var path = require('path');
['../modules/core/server/models/core.defaults.model'].forEach(function (modelPath) {
	require(path.resolve(modelPath));
});

var mongoose = require('mongoose');
var defaults = mongoose.model ('_Defaults');
var Promise = require('Promise');
var _ = require('lodash');

var run = function(url) {

	mongoose.connect(url);

	return new Promise(function(resolve, reject) {
		console.log('start - seed the defaults');
		require('../config/seed-data/defaults')()
			.then(
				function() {
					console.log('defaults collection reset.');
					resolve();
				},
				function(err) {
					console.log('defaults collection not reset.  error = ', JSON.stringify(err));
					reject(err);
				}
			);
	});
};

module.exports.run = run;
