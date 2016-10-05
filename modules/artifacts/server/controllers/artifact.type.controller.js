'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path = require('path');
var DBModel = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _ = require('lodash');
var mongoose = require('mongoose');

module.exports = DBModel.extend({
	name: 'ArtifactType',
	plural: 'artifacttypes',
	bind: [
		'getMultiples',
		'getNonMultiples'
	],
	// -------------------------------------------------------------------------
	//
	// get all records that allow multiples
	//
	// -------------------------------------------------------------------------
	getMultiples: function () {
		var self = this;
		// console.log (self.name);
		return new Promise(function (resolve, reject) {
			self.findMany({multiple: true}, {code: 1, name: 1, phase: 1})
			// .then (function (result) {
			// 	return result.map (function (e) {
			// 		return e.type;
			// 	});
			// })
			.then(resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get all records that do not allow multiples
	//
	// -------------------------------------------------------------------------
	getNonMultiples: function () {
		var self = this;
		// console.log (self.name);
		return new Promise(function (resolve, reject) {
			self.findMany({multiple: false}, {code: 1, name: 1, phase: 1})
			// .then (function (result) {
			// 	return result.map (function (e) {
			// 		return e.type;
			// 	});
			// })
			.then(resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get just the template types
	//
	// -------------------------------------------------------------------------
	templateTypes: function () {
		return this.findMany({isTemplate: true}, {code: 1, name: 1});
	},
	// -------------------------------------------------------------------------
	//
	// get from a code
	//
	// -------------------------------------------------------------------------
	fromCode: function (code) {
		return this.findOne({code: code});
	}
});
