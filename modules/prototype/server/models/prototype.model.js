'use strict';
module.exports = require('../../../core/server/controllers/core.schema.controller')('Prototype', {
	_id: {type: String, default: 'prototype'},
	code: {type: String, default: 'prototype'},
	data: {type: Object, default: null}
});