'use strict';
module.exports = require('../controllers/core.schema.controller')('CodeList', {
	name: {type: String, index: true, required: true},
	items: [{
		_id: false,
		value: {type: String},
		display: {type: String},
		order: {type: Number},
		active: {type: Boolean, default: true}
	}]
});
