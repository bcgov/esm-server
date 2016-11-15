'use strict';
var helpers  = require ('../../../core/server/controllers/core.helpers.controller');
var mongoose = require ('mongoose');
var Prototype = mongoose.model('Prototype');
var _        = require ('lodash');


exports.get = function(req, res) {
	var query = {_id: 'prototype'};
	Prototype.find (query, function (err, documents) {
		if (err) return helpers.sendError (res, err);
		else {
			if (!documents || documents.length === 0) {
				console.log('Error: No prototype record found.');
				return helpers.sendError (res, new Error('No prototype record found.'));
			}
			var data = documents[0].data;
			if (!data) {
				console.log('Error: No prototype data found.');
				return helpers.sendError (res, new Error('No prototype data found.'));
			}
			if (!data.agencies) {
				console.log('Error: Invalid prototype data found - no agencies.');
				return helpers.sendError (res, new Error('Invalid prototype data found.'));
			}
			return helpers.sendData(res, documents[0].data);
		}
	});
};