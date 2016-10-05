'use strict';

var mongoose = require('mongoose');
var Application = mongoose.model('Application');
var Prom = require('promise');
var ApplicationCtrl = require(require('path').resolve('./modules/core/server/controllers/core.application.controller'));

module.exports = function () {
	return new Prom (function (resolve, reject) {
		console.log ('Running application seeding');

		var appCtrl = new ApplicationCtrl({context: 'application', user: {}});
		var a = new Application ({
			_id         : 'application',
			code        : 'application',
			read        : ['public', '*'],
			isPublished : true
		});

		appCtrl.setForce(true);
		return appCtrl.create(a).then(resolve, reject);
	});
};
