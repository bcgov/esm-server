'use strict';

var mongoose = require ('mongoose');
var Organization = mongoose.model ('Organization');
var orglist = require ('./orglist');
var _        = require ('lodash');
var chalk         = require('chalk');

module.exports = function () {
	_.each (orglist, function (org) {
		Organization.find ({code:org.code}, function (err, result) {
			if (result.length === 0) {
				var o = new Organization (org);
				o.save ();
			}
		});
	});
};
