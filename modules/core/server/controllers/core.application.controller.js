'use strict';
// =========================================================================
//
// Controller for application
//
// =========================================================================
module.exports = require ((require('path'))
	.resolve('./modules/core/server/controllers/core.dbmodel.controller'))
	.extend ({
	name : 'Application',
	plural : 'applications',
	decorateCollection: true,
	// -------------------------------------------------------------------------
	//
	// get the one and only application object from the database
	//
	// -------------------------------------------------------------------------
	getTheOne: function () {
		return this.list ()
		.then (function (arr) {
			return arr[0];
		});
	}
});

