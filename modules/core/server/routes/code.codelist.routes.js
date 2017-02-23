'use strict';

var routes = require('../controllers/core.routes.controller');
var policy = require('../controllers/core.policy.controller');

var controller = require ('../controllers/core.codelist.controller.js');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'codelists', controller, policy, null, { get:'guest', paginate:'guest' });

};