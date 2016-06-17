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
	getTheOne: function () {
		return this.findFirst ({});
	}
});

