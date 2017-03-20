'use strict';

var path        = require('path');
var controller	= require (path.resolve('./modules/codelists/server/controllers/codelist.controller'));
var routes      = require (path.resolve('./modules/core/server/controllers/core.routes.controller'));
var policy      = require (path.resolve('./modules/core/server/controllers/core.policy.controller'));

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'codelists', controller, policy);
};
