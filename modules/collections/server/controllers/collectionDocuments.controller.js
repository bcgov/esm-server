'use strict';
// =========================================================================
//
// Controller for Collections
//
// =========================================================================
var path     = require('path');
var DBModel  = require(path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend({
	name: 'Collectiondocument',
	plural: 'collectiondocuments',
	populate   : [{
		path     : 'addedBy',
		select   : '_id displayName username email orgName'
	}, {
		path     : 'updatedBy',
		select   : '_id displayName username email orgName'
	}, {
		path     : 'document',
	}],
});
