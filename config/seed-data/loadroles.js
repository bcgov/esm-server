'use strict';
var _        = require ('lodash');
var mongoose = require('mongoose');
var Role     = mongoose.model('Role');
var list     = require ('./roledata');
var promise  = require('promise');
var util     = require('util');

module.exports = function () {
	promise.resolve ()
	.then (function () {
		return promise.all (list.map (function (role) {
			console.log ('removing role ',role.code);
			return Role.remove ({code:role.code});
		}));
	})
	.then (function () {
		return promise.all (list.map (function (role) {
			console.log ('adding role ',role.code);
			var r = new Role (role);
			r.roleCode = r.code;
			return r.save ();
		}));
	})
	.then (function () {
		console.log ('all done adding some artifcat types and other things');
	})
	.catch (function (err) {
		console.log ('oops, something went wrong', err);
	});

};
