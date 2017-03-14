'use strict';

var path           = require('path');
var DBModel        = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
	name: 'CodeList',
	plural: 'codelists'
});