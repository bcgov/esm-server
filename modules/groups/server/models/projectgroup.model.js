'use strict';

module.exports = require('../../../core/server/controllers/core.schema.controller.js')
('ProjectGroup', {
	__audit: true,
	__access: [],

	name: {type: String, default: ''},
	type: {type: String, default: ''},

	groupId: {type: Number, default: 0}, // From ePIC
	epicProjectID: {type: Number, default: 0},  // Used to relate ePIC imports

	project: {type: 'ObjectId', ref: 'Project', default: null, index: true},
	members: [{type: 'ObjectId', ref: 'User', default: null}]
});
