'use strict';
// =========================================================================
//
// Controller for Task
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'ValuedComponent',
	newAssessmentBoundary : function () {
		var self = this;
		return new Promise (function(resolve, reject) {
			resolve ( self.model.assessmentBoundaries.create () );
		});
	},
	newExistingCondition : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.aaa.create () );
		});
	},
	newPotentialEffect : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.aaa.create () );
		});
	},
	newMitigationMeasure : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.aaa.create () );
		});
	},
	newCumulativeEffect : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.aaa.create () );
		});
	},

});
