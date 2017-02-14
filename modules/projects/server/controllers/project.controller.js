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
	},

	decorate: function(o) {
		// didn't want to waste time figuring out how to get virtual schema functions to work in the
		// schema controller mess.
		// just putting this here to help on the map windows.
		var parseContent = function(p, type, page) {
			try {
				var content = _.find(p.content, function(o) { return o.type === type && o.page === page; });
				return content.html || content.text;
			} catch(e) {
				return '';
			}
		};

		var overviewIntroText = parseContent(o, 'OVERVIEW_INTRO_TEXT', 'MINES');
		o._doc.overviewIntroText = overviewIntroText;

		return o;
	}

});

