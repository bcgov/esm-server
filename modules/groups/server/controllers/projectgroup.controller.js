'use strict';

var path      = require('path');
var _         = require ('lodash');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var User      = require('mongoose').model('User');

module.exports = DBModel.extend ({
	name: 'ProjectGroup',
	plural: 'projectgroups',
	populate: 'members members.org',
	sort: 'type name',

	getForProject: function (id) {
		return this.list({project: id});
	}

});
