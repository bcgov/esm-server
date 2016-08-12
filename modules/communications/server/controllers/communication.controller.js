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
	name: 'Communication',
	plural: 'communications',
	sort: {dateUpdated:-1},
	populate: 'artifacts artifacts.name artifacts.version artifacts.versionNumber',


	preprocessAdd : function (model) {
		var self = this;
		console.log('Communication.preprocessAdd: ', JSON.stringify(model, null, 4));
		return model;
	},

	getForProject: function (id) {
		return this.list({project: id});
	},
	getForGroup: function (id) {
		return this.list({group: {$in: [id] }});
	}
});
