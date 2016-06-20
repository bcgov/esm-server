'use strict';
// =========================================================================
//
// Controller for application
//
// =========================================================================
module.exports = require ((require('path'))
	.resolve('./modules/core/server/controllers/cc.dbmodel.controller'))
	.extend ({
	name : 'Application',
	plural : 'applications',
	decorateCollection: true,
	getTheOne: function () {
		console.log ('get the first applicaiton model');
		return this.list ()
		.then (function (arr) {
			return arr[0];
		});
	}
});

