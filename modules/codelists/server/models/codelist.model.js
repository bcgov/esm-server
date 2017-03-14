'use strict';
var path		= require('path');
module.exports	= require(path.resolve('./modules/core/server/controllers/core.schema.controller'))
('CodeList', {
	name: {type: String, index: true, required: true},
	displayName: {type: String},
	items: [{
		_id: false,
		value: 						{type: String},
		display: 					{type: String},
		order: 						{type: Number},
		displayPriority:	{type: Boolean, default: false},
		active: 					{type: Boolean, default: true}
	}]
});
