'use strict';
var _ = require ('lodash');

var returnOk = function (ok, res, next) {
	return ok ? next () : res.status(403).json ({ message: 'User is not authorized' });
};
module.exports = function (def) {
	return function (req, res, next) {
		var method = req.method.toLowerCase ();
		var type;
		if (_.isObject (def)) {
			type = def[method] || def.all || 'admin';
		} else {
			type = def;
		}
		if (type === 'prototype') {
			return returnOk ((!!req.user && (!!~req.user.roles.indexOf('admin') || !!~req.user.roles.indexOf('prototype'))), res, next);
		}
		else if (type === 'admin') {
			return returnOk ((!!req.user && !!~req.user.roles.indexOf ('admin')), res, next);
		}
		else {
			return returnOk (false, res, next);
		}
	};
};