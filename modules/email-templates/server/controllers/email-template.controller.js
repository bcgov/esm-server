'use strict';
// =========================================================================
//
// Controller for orgs
//
// =========================================================================
var path        = require('path');
var DBModel     = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var _           = require ('lodash');
var mongoose    = require ('mongoose');
var Model       = mongoose.model ('EmailTemplate');

module.exports = DBModel.extend ({
	name : 'EmailTemplate',
	plural : 'emailtemplates'
});
