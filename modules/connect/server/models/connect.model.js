'use strict';

module.exports = require('../../../core/server/controllers/core.schema.controller')
('ConnectComment', {
	date: {type: Date, default: Date.now},
	name: {type: String, default: ''},
	email: {type: String, default: ''},
	comment: {type: String, default: ''}
});
