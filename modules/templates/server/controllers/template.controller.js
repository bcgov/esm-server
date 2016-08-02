'use strict';
// =========================================================================
//
// Controller for templates
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Template',
	plural : 'templates',
	preprocessAdd: function (model) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.getCurrentType (model.documentType).then (function (latest) {
				if (latest && latest.versionNumber) {
					model.versionNumber = latest.versionNumber + 1;
				} else {
					model.versionNumber++;
				}
				return model;
			})
			.then (resolve, reject);
		});
	},
	preprocessUpdate: function (model) {
		// console.log ('updating model', model);
		// console.log ('this = ', this);
		var self = this;
			model = model.toObject ();
			delete model._id;
			var newmodel = new self.model (model);
			newmodel.versionNumber++;
			return newmodel;
	},
	getCurrentType: function (documentType) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst ({documentType:documentType},null,{versionNumber:-1})
			.then (function (docs) {
				if (docs[0]) return docs[0];
				else return null;
			})
			.then (resolve, reject);
		});
	},
	getCurrentCode: function (code) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst ({code:code},null,{versionNumber:-1})
			.then (function (docs) {
				if (docs[0]) return docs[0];
				else return null;
			})
			.then (resolve, reject);
		});
	},
	newSection : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			var doc = new self.model ();
			var section = doc.sections.create ();
			resolve (section);
		});
	},
	newMeta : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.newSection().then (function (section) {
				var meta = section.meta.create ();
				resolve (meta);
			});
		});
	},
	currentTemplates: function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.model.aggregate ([
			    { "$sort": { "versionNumber": -1 } },
			    { "$group": {
					"_id"           : "$documentType",
					"id"            : {"$first": "$_id"},
					"documentType"  : {"$first": "$documentType"},
					"versionNumber" : { "$first": "$versionNumber" },
					"dateUpdated"   : { "$first": "$dateUpdated" }
			    }}
			], function (err, result) {
				if (err) return reject (err);
				else resolve (result);
			});
		});
	}
});

/*

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
	plural : 'valuedcomponents',
	newAssessmentBoundary : function () {
		var self = this;
		return new Promise (function(resolve, reject) {
			resolve ( self.model.assessmentBoundaries.create () );
		});
	},
	newExistingCondition : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.existingConditions.create () );
		});
	},
	newPotentialEffect : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.potentialEffects.create () );
		});
	},
	newMitigationMeasure : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.mitigationMeasures.create () );
		});
	},
	newCumulativeEffect : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			resolve (self.model.cumulativeEffects.create () );
		});
	},
	listForProject : function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// console.log ('project = ', project);
			self.list ({
				project: project._id
			})
			.then (resolve, reject);
		});
	},
});
*/
