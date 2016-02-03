'use strict';
// =========================================================================
//
// Controller for activity bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	bind : ['addTaskToActivity'],
	name : 'ActivityBase',
	addTaskToActivity : function (parent, child) {
		var self = this;
		return new Promise (function (resolve, reject) {
			parent.tasks.push (child._id);
			self.saveAndReturn(parent)
			.then (resolve, reject);
		});
	}
});


