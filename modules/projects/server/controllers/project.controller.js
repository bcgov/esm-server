'use strict';

var _        = require ('lodash');
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
    sort: { name : 1 },

	preprocessAdd : function (o) {
		var self = this;

		return new Promise(function (resolve, reject) {
			if (_.isEmpty(o.code)) {
				o.code = o.name.toLowerCase();
				o.code = o.code.replace(/\W/g, '-');
				o.code = o.code.replace(/^-+|-+(?=-|$)/g, '');
			}
			if (_.endsWith(o.code, '-')) {
				o.code = o.code.slice(0, -1);
			}

			self.guaranteeUniqueCode(o.code)
				.then(function(code) {
					//console.log('code = ', code);
					o.code = code;
					return o;
				})
				.then (resolve, reject);
		});
	}

});

