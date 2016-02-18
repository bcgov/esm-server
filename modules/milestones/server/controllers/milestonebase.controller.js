'use strict';
// =========================================================================
//
// Controller for milestone bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'MilestoneBase',
	populate: 'activities',
	preprocessAdd: function (me) {
		me.read.push ('eao');
		me.submit.push ('admin');
		return me;
	},
	addActivityToMilestone : function (parent, child) {
		var self = this;
		return new Promise (function (resolve, reject) {
			parent.activities.push (child._id);
			self.saveAndReturn(parent)
			.then (resolve, reject);
		});
	}
});


