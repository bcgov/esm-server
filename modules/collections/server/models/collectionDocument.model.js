'use strict';
// =========================================================================
//
// Collection Document Model
//
var path = require('path');

module.exports = require(path.resolve('./modules/core/server/controllers/core.schema.controller'))
('Collectiondocument', {
	__audit   : true,
	__access  : [],

	document  : { type: 'ObjectId', ref: 'Document' },

	dateAdded : { type: Date, default: Date.now },
	updatedBy : { type: 'ObjectId', ref:'User', default: null },

	sortOrder : { type: 'Number', default: Date.now },
});
