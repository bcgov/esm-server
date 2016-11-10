'use strict';
var mongoose = require ('mongoose');
var Prototype = mongoose.model ('Prototype');
var promise = require('promise');
var _ = require('lodash');


module.exports = function () {

	var json = {inspection: {_id: 'a', name: 'my name is...', actions: [{_id: 'x', name: 'action!'}]}};

	Prototype.find({_id: 'prototype'}, function (err, records) {
		if (records.length === 0) {
			var proto = new Prototype ({
				_id : 'prototype',
				code : 'prototype',
				data : json
			});
			proto.save(function (err, rec) {
				if (err) {
					console.log('Failed to add MMTI Prototype data', err);
				} else {
					console.log('MMTI Prototype data added');
				}
			});
		} else {
			console.log('MMTI Prototype data exists');
		}
	});





};