'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path      = require('path');
var _         = require ('lodash');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


module.exports = DBModel.extend ({
	name: 'Cotification',
	plural: 'cotifications',


	preprocessAdd : function (model) {
		var self = this;
		console.log('Cotification.preprocessAdd: ', JSON.stringify(model, null, 4));
	},

	getForProject: function (id) {
		return this.list({project: id});
	},
	getForGroup: function (id) {
		return this.list({group: {$in: [id] }});
	}
});
