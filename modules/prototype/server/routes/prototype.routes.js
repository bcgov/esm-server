'use strict';

var routes = require('../../../core/server/controllers/core.routes.controller');
var _ = require('lodash');
var policy = require('../controllers/prototype.policy.controller');
var PrototypeCtrl = require('../controllers/prototype.controller');

module.exports = function (app) {

	app.route('/api/admin/prototype')
		.all(policy('prototype'))
		.get(PrototypeCtrl.get);


};