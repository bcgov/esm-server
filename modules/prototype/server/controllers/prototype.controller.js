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
			var proto = documents[0].data;
			return helpers.sendData(res, proto);
		}
	});
};