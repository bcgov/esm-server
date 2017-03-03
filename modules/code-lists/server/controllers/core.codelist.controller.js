'use strict';

var DBModel   = require ('../../core/server/controllers/core.dbmodel.controller');

module.exports = DBModel.extend ({
	name: 'CodeList',
	plural: 'codelists'
});