'use strict';
// =========================================================================
//
// Routes for Collections
//
// =========================================================================
var path               = require('path');
var CollectionDocClass = require(path.resolve('./modules/collections/server/controllers/collectionDocuments.controller'));
var routes             = require(path.resolve('./modules/core/server/controllers/core.routes.controller'));
var policy             = require(path.resolve('./modules/core/server/controllers/core.policy.controller'));

module.exports = function(app) {
	routes.setCRUDRoutes(app, 'collectiondocument', CollectionDocClass, policy);
};
