'use strict';
// =========================================================================
//
// Controller for activity bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'ActivityBase',
	plural : 'activitybases',
	populate: 'tasks',
	preprocessAdd: function (me) {
		me.read.push ('eao');
		me.submit.push ('admin');
		return me;
	},
	addTaskToActivity : function (parent, child) {
		var self = this;
		return new Promise (function (resolve, reject) {
			parent.tasks.push (child._id);
			self.saveAndReturn(parent)
			.then (resolve, reject);
		});
	}
});


