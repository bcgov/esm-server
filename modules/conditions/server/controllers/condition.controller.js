'use strict';
// =========================================================================
//
// Controller for conditions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Condition',
	plural : 'conditions',
	// -------------------------------------------------------------------------
	//
	// because the historical conditions all are numbered, we used code for the
	// number. increment on post
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (model) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.model.find ({})
			.sort ({code:-1})
			.limit (1)
			.exec ()
			.then (function (m) {
				var c = parseInt (m.code) + 1;
				model.code = c.toString ();
				resolve (model);
			});
		});
	},
	decorate: function (model) {
		model = (model.toObject) ? model.toObject(): model;
		model.stageString = model.stages.join (', ');
		model.pillarString = model.pillars.join (', ');
		return model;
	},
	nothing: function (condition) {
		var self = this;
		return new Promise (function (resolve, reject) {
			console.log (condition);
			self.addModelPermissions (condition, {
				write: ['application:buddy'],
				delete: ['application:buddy'],
				modifyDescription: ['application:buddy']
			});
			resolve ({ok:true});
		});
	}
});

