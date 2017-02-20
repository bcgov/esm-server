'use strict';
// =========================================================================
//
// Controller for Documents
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var mongoose 	= require ('mongoose');
var OtherDocument 	= mongoose.model ('OtherDocument');

module.exports = DBModel.extend ({
	name : 'OtherDocument',
	plural : 'otherdocuments',
	populate: [{ path: 'project', select: 'name code' }, { path: 'agencies', select: 'code name orgCode' }],

	getForProject : function (projectid) {
		return this.list ({project: projectid});
	},

	getForProjectCode : function (projectCode) {
		return this.list ({projectCode: projectCode});
	},

	getForAgency : function (agencyid) {
		return this.list ({agencies: { $in: [agencyid] } });
	}

});

