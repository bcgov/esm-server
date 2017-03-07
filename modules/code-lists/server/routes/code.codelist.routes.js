'use strict';

var controller	= require ('../controllers/core.codelist.controller');
var routes			= require ('../../../core/server/controllers/core.routes.controller');
var policy			= require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'codelists', controller, policy);
};
