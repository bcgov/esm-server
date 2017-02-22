'use strict';

var ConnectComment     = require ('../controllers/connect.controller');
var _           = require ('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'comment', ConnectComment, policy, null, {all:'guest'});
};

