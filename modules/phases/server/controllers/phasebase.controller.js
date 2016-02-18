'use strict';
// =========================================================================
//
// Controller for phase bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'PhaseBase',
	populate: 'milestones',
	preprocessAdd: function (me) {
		me.read.push ('eao');
		me.submit.push ('admin');
		return me;
	},
	addMilestoneToPhase : function (parent, child) {
		var self = this;
		return new Promise (function (resolve, reject) {
			parent.milestones.push (child._id);
			self.saveAndReturn(parent)
			.then (resolve, reject);
		});
	}
});


